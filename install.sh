#!/bin/bash
## Notas Installation Script for Linux
## Installs notas: prefers a prebuilt GitHub release, falls back to building
## from source (git clone + npm install + npm run build).

set -e

echo "🦀 Notas Installer"
echo "=================="

INSTALL_DIR="$HOME/.local/bin"
NOTAS_BIN="$INSTALL_DIR/notas"
SRC_DIR="$HOME/.notas/src"
REPO="https://github.com/TwitteryBeast12/Notas.git"

## 1. Node.js check
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is required but not found."
  echo "   Install it from https://nodejs.org or your package manager:"
  echo "     sudo apt install nodejs npm   # Debian/Ubuntu"
  echo "     brew install node              # macOS"
  exit 1
fi
echo "✅ Node.js $(node --version) found"

## 2. Install directory
mkdir -p "$INSTALL_DIR"

## 3. Try prebuilt release first
echo "📥 Checking for a prebuilt release..."
LATEST=$(curl -s --max-time 15 https://api.github.com/repos/TwitteryBeast12/Notas/releases/latest || true)
DOWNLOAD_URL=$(printf '%s' "$LATEST" | grep -o '"browser_download_url": "[^"]*notas-linux"' | cut -d'"' -f4 || true)

if [ -n "$DOWNLOAD_URL" ]; then
  echo "⬇️  Downloading prebuilt binary..."
  curl -L -o "$NOTAS_BIN" "$DOWNLOAD_URL"
  chmod +x "$NOTAS_BIN"
  if "$NOTAS_BIN" --version >/dev/null 2>&1; then
    echo "✅ Installed prebuilt binary"
  else
    echo "⚠️  Downloaded binary failed verification — building from source instead."
    rm -f "$NOTAS_BIN"
    DOWNLOAD_URL=""
  fi
fi

if [ -z "$DOWNLOAD_URL" ]; then
  echo "⚠️  No working prebuilt release found — building from source."
  command -v git >/dev/null 2>&1 || { echo "❌ git is required to build from source."; exit 1; }
  rm -rf "$SRC_DIR"
  git clone --depth 1 "$REPO" "$SRC_DIR" >/dev/null 2>&1
  ( cd "$SRC_DIR" && npm install && npm run build )
  cat > "$NOTAS_BIN" <<EOF
#!/bin/bash
exec node "$SRC_DIR/dist/cli.js" "\$@"
EOF
  chmod +x "$NOTAS_BIN"
  echo "✅ Built and installed from source"
fi

## 4. PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
  echo ""
  echo "⚠️  $INSTALL_DIR is not in your PATH"
  echo "Add this to your ~/.bashrc or ~/.zshrc:"
  echo '  export PATH="$HOME/.local/bin:$PATH"'
  read -p "Add it now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    shellrc="$HOME/.bashrc"
    [[ -n "$ZSH_VERSION" ]] && shellrc="$HOME/.zshrc"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$shellrc"
    echo "✅ Added to $shellrc"
  fi
fi

## 5. Config dir
mkdir -p "$HOME/.notas"

## 6. Verify
echo ""
echo "Verifying installation..."
if "$NOTAS_BIN" --version 2>/dev/null; then
  echo "✅ Verification successful"
else
  echo "⚠️  Verification failed — try: $NOTAS_BIN --help"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Run: notas config   (set up API keys)"
echo "  2. Record: notas rec \"my-task\"   ...work...   notas stop \"my-task\""
echo "  3. Review interactively: notas review"
echo ""
echo "Full docs: https://github.com/TwitteryBeast12/Notas"
