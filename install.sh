#!/bin/bash
# Notas Installation Script for Linux
# Downloads and installs the latest notas binary

set -e

echo "🦀 Notas Installer"
echo "=================="

INSTALL_DIR="$HOME/.local/bin"
NOTAS_BIN="$INSTALL_DIR/notas"

# Create install directory
if [ ! -d "$INSTALL_DIR" ]; then
    mkdir -p "$INSTALL_DIR"
    echo "✅ Created install directory: $INSTALL_DIR"
fi

# Download latest release
echo "📥 Downloading latest release..."
LATEST_RELEASE=$(curl -s https://api.github.com/repos/TwitteryBeast12/Notas/releases/latest)
DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | grep -o '"browser_download_url": "[^"]*notas-linux"' | cut -d'"' -f4)

if [ -z "$DOWNLOAD_URL" ]; then
    echo "❌ Failed to find notas-linux in latest release"
    exit 1
fi

curl -L -o "$NOTAS_BIN" "$DOWNLOAD_URL"
chmod +x "$NOTAS_BIN"
echo "✅ Downloaded notas"

# Add to PATH if not already
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo ""
    echo "⚠️  $INSTALL_DIR is not in your PATH"
    echo "Add this to your ~/.bashrc or ~/.zshrc:"
    echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
    read -p "Add it now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$HOME/.bashrc"
        echo "✅ Added to ~/.bashrc"
        echo "   Run 'source ~/.bashrc' or restart terminal"
    fi
fi

# Create config directory
mkdir -p "$HOME/.notas"

# Final instructions
echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Run: notas --help"
echo "  2. Run: notas config (set up API keys)"
echo "  3. Record your first session:"
echo "     notas rec \"my-task\""
echo "     # ... do your work ..."
echo "     notas stop \"my-task\""
echo ""
echo "Interactive TUI:"
echo "  notas review"
echo ""
