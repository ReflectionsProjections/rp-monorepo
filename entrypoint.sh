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

mkdir -p /shared/logs

declare -A WORKSPACES=(
    ["hype"]="$BUILD_HYPE"
    ["admin"]="$BUILD_ADMIN"
    ["info"]="$BUILD_INFO"
    ["site"]="$BUILD_SITE"
)

cp /.env /shared/rp-api/
cp /.env /shared/rp-web/

# Start the API
echo "Starting API..."
setsid bash -c "cd /shared/rp-api && yarn install && yarn start 2>&1 | tee /shared/logs/api.log" &

# Start the web setup
echo "Starting web setup..."
setsid bash -c "cd /shared/rp-web && yarn && yarn prepare | tee /shared/logs/web.log" &

# Start the workspaces
for workspace in "${!WORKSPACES[@]}"; do
    if [[ "${WORKSPACES[$workspace]}" == "true" ]]; then
        echo "Building @rp/$workspace..."
        mkdir -p "/shared/logs/$workspace"
        setsid bash -c "cd /shared/rp-web && yarn workspace @rp/$workspace dev --host 2>&1 | tee /shared/logs/$workspace/$workspace.log" &
    fi
done

exec bash