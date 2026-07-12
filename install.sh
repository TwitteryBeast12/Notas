#!/bin/bash
## Notas Installation Script for Linux
## Builds notas from source (git clone + npm install + npm run build) and
## installs a launcher into ~/.local/bin. No prebuilt binary is required.

set -e

echo "🦀 Notas Installer"
echo "=================="

INSTALL_DIR="$HOME/.local/bin"
NOTAS_BIN="$INSTALL_DIR/notas"
SRC_DIR="$HOME/.notas/src"
REPO="https://github.com/TwitteryBeast12/Notas.git"

## 1. Prerequisites
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is required but not found."
  echo "   Install from https://nodejs.org or: sudo apt install nodejs npm"
  exit 1
fi
echo "✅ Node.js $(node --version) found"

if ! command -v git >/dev/null 2>&1; then
  echo "❌ git is required to build from source."
  exit 1
fi

## 2. Install directory
mkdir -p "$INSTALL_DIR"

## 3. Clone + build from source
echo "📦 Building notas from source..."
rm -rf "$SRC_DIR"
git clone --depth 1 "$REPO" "$SRC_DIR" >/dev/null 2>&1
( cd "$SRC_DIR" && npm install && npm run build )

cat > "$NOTAS_BIN" <<EOF
#!/bin/bash
exec node "$SRC_DIR/dist/cli.js" "\$@"
EOF
chmod +x "$NOTAS_BIN"
echo "✅ Installed launcher to $NOTAS_BIN"

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
