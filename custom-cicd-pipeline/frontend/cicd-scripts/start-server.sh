#!/bin/bash
echo "hello from start-server"
pwd
whoami
ls
sudo su

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash 
/.nvm/nvm.sh # .nvm will be available inside the $HOME directory
# configure to use nvm right away:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install 16
node -v

cd /frontend
npm i

# Find and kill all Node.js processes related to the previous Next.js app
killall -TERM node

# Wait for the processes to stop (adjust the sleep duration based on your application's shutdown time)
sleep 5

# Run the npm start command in the background
npm run start -- -p 80 >/dev/null 2>&1 &

# Exit the script immediately after starting the server
exit 0