"""
A compact U-Net implementation (PyTorch) for pixel-level segmentation
of detected debris objects, plus a loader that pulls in fine-tuned
weights if available. Falls back to randomly-initialized weights so
the pipeline is runnable end-to-end before training is finished —
segmentation quality will obviously be poor until you train and drop
in real weights at UNET_WEIGHTS_PATH.
"""

import os
import logging

import torch
import torch.nn as nn

from app.config import UNET_WEIGHTS_PATH, DEVICE

logger = logging.getLogger(__name__)


class DoubleConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class UNet(nn.Module):
    """Small U-Net: 1-channel sonar input -> 1-channel mask output."""

    def __init__(self, in_channels=1, out_channels=1, base_filters=32):
        super().__init__()
        f = base_filters

        self.enc1 = DoubleConv(in_channels, f)
        self.enc2 = DoubleConv(f, f * 2)
        self.enc3 = DoubleConv(f * 2, f * 4)
        self.pool = nn.MaxPool2d(2)

        self.bottleneck = DoubleConv(f * 4, f * 8)

        self.up3 = nn.ConvTranspose2d(f * 8, f * 4, 2, stride=2)
        self.dec3 = DoubleConv(f * 8, f * 4)
        self.up2 = nn.ConvTranspose2d(f * 4, f * 2, 2, stride=2)
        self.dec2 = DoubleConv(f * 4, f * 2)
        self.up1 = nn.ConvTranspose2d(f * 2, f, 2, stride=2)
        self.dec1 = DoubleConv(f * 2, f)

        self.out_conv = nn.Conv2d(f, out_channels, 1)

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))

        b = self.bottleneck(self.pool(e3))

        d3 = self.up3(b)
        d3 = self.dec3(torch.cat([d3, e3], dim=1))
        d2 = self.up2(d3)
        d2 = self.dec2(torch.cat([d2, e2], dim=1))
        d1 = self.up1(d2)
        d1 = self.dec1(torch.cat([d1, e1], dim=1))

        return torch.sigmoid(self.out_conv(d1))


_unet_model = None  # lazy-loaded singleton


def load_unet_model() -> UNet:
    """Load (once) and cache the U-Net model. Call at app startup."""
    global _unet_model
    if _unet_model is not None:
        return _unet_model

    model = UNet(in_channels=1, out_channels=1)

    if os.path.exists(UNET_WEIGHTS_PATH):
        logger.info(f"Loading fine-tuned U-Net weights from {UNET_WEIGHTS_PATH}")
        state_dict = torch.load(UNET_WEIGHTS_PATH, map_location=DEVICE)
        model.load_state_dict(state_dict)
    else:
        logger.warning(
            "No fine-tuned U-Net weights found at %s — using randomly-initialized "
            "weights. Segmentation output will be meaningless until you train and "
            "save weights there.",
            UNET_WEIGHTS_PATH,
        )

    model.to(DEVICE)
    model.eval()
    _unet_model = model
    return _unet_model


def is_unet_loaded() -> bool:
    return _unet_model is not None