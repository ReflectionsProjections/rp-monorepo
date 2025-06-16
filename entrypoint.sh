#!/bin/bash
set -euo pipefail

echo "
              :=+****#**=.              
            :+*==-=+++***#+.            
           +*=---+**+++++**#=           
          =*-----+*++++++++*%-          
         .#------=+**++++++**%          
     .:==*#-------==++*+**###%+=-:      
   -++=--=#----------=*##+=-----=+++:   
 .*+-:::::#+---------+#=------------*+  
.#=:::::::-#+-------*#---------------+* 
*+:::::::::-*#+=---=#-----------------++
%-::::::::-==+*#*++##==--------======--%
%+-::::::-++++=+++*%*++**+----=========%
*#=======++++++++=+%=----+**=========-**
 **=++++++++++++=+#+-------+#=======-+#.
  +#++==+++++==+*#+---------+#======**. 
   :+***+++++**##+=----------#+=++*+:   
      :-=+%##**+++++=--------#*==:.     
          %*+++++++**+=------#.         
          -%+++++++++*+-----*=          
           =#*+++++++*=---=*=           
            .+#**++++=--=*+:            
              .=**#****+=:              
"
echo -e "\033[1m\033[36mWelcome to the RP Dev Portal 🚀\033[0m"

# Create necessary directories
mkdir -p /shared/logs

# Define workspaces
declare -A WORKSPACES=(
    ["hype"]="$BUILD_HYPE"
    ["admin"]="$BUILD_ADMIN"
    ["info"]="$BUILD_INFO"
    ["site"]="$BUILD_SITE"
    ["sponsor"]="$BUILD_SPONSOR"
)

# Copy environment files
echo "Copying environment files..."
cp /.env /shared/rp-api/ 2>/dev/null || echo "Warning: Could not copy .env to rp-api"
cp /.env /shared/rp-web/ 2>/dev/null || echo "Warning: Could not copy .env to rp-web"

# Function to check if a command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "\033[32m✓ $1 completed successfully\033[0m"
    else
        echo -e "\033[31m✗ $1 failed\033[0m"
        return 1
    fi
}

# Start the API
echo -e "\033[1mStarting API setup...\033[0m"
cd /shared/rp-api
yarn install
check_status "API dependencies installation"
setsid bash -c "yarn start 2>&1 | tee /shared/logs/api.log" &
check_status "API startup"

# Setup web
echo -e "\033[1mStarting web setup...\033[0m"
cd /shared/rp-web
yarn install
check_status "Web dependencies installation"
yarn prepare
check_status "Web preparation"

# Start the workspaces
for workspace in "${!WORKSPACES[@]}"; do
    if [[ "${WORKSPACES[$workspace]}" == "true" ]]; then
        echo -e "\033[1mBuilding @rp/$workspace...\033[0m"
        mkdir -p "/shared/logs/$workspace"
        cd /shared/rp-web
        setsid bash -c "yarn workspace @rp/$workspace dev --host 2>&1 | tee /shared/logs/$workspace/$workspace.log" &
        check_status "@rp/$workspace startup"
    fi
done

echo -e "\033[1m\033[32mAll services started successfully! 🎉\033[0m"
echo -e "\033[1mLogs are available in /shared/logs/\033[0m"

exec bash