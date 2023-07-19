#!/bin/bash
echo "hello from before-install"

sudo su
export HOME=/root
whoami
cd /root

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash 
/root/.nvm/nvm.sh # .nvm will be available inside the $HOME directory
# configure to use nvm right away:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install 16
node -v