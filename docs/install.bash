#!/usr/bin/env bash

CLIFF_HOME="$HOME/.cliffhanger"
mkdir -p $CLIFF_HOME
cd $CLIFF_HOME

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

if [ "$ARCH" = "x86_64" ]; then
  ARCH="x64"
elif [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
  ARCH="arm64"
else
  echo "❌ Unsupported architecture: $ARCH"
  exit 1
fi

FILE="bun-${OS}-${ARCH}"

LATEST_RELEASE=$(curl -s "https://api.github.com/repos/plopix/cliffhanger/releases/latest" | grep tag_name | cut -d'"' -f 4)
URL="https://github.com/plopix/cliffhanger/releases/download/${LATEST_RELEASE}/cliffhanger-${FILE}"

echo "🌍 Detected platform: ${OS}-${ARCH}"
echo "📥 Downloading file: ${URL}"

if curl -fLO "${URL}"; then
  echo "✅ Successfully downloaded ${FILE}"
else
  echo "❌ Failed to download ${FILE}. Please check the URL or platform."
  exit 1
fi

ln -sf $CLIFF_HOME/cliffhanger-${FILE} $HOME/cliff
chmod +x $HOME/cliff

echo "You can now use CLIffhanger by running: ~/cliff"
echo ""
echo "- You may want to put ~/cliff in you PATH"
echo "- You may want to creat an alias (in your .zshrc or .bashrc) alias cliff='~/cliff'"

~/cliff
exec "$SHELL" -l
