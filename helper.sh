#!/bin/bash

# Exit on Error
set -e

# Ansi color code variables
green="\033[0;92m"
red="\033[0;91m"
reset="\033[0m"

Help()
{
   # Display Help
   echo -e "
   🐲 helper.sh:
   Syntax: scriptTemplate [-h | db-applysql]
    options
    h                Print this Help.
    db-applysql      Apply .sql file in docker-entrypoint-initdb.d/ to --container-name as --postgres-user
                     -c | --container-name      *(postgresql container name)
                     -p | --postgres-user       *(psql database user)
                     -f | --file                *(schema file in postgres docker-entrypoint-initdb.d/ directory)
    db-applybackup   Apply a gzip backup of a postgres database file to the docker postgresql database
                     -c | --container-name      *(postgresql container name)
                     -d | --postgres-db-name    *(psql database name)
                     -f | --file                *(file of database backup)          
    up               Build the app by using docker compose up
    start            Start the app by using docker compose up -d
    stop             Stop the app by using docker compose stop
   "
}

GetOptions()
{
    if [ getopts ] # true = no opts given
    then
        echo -e "🐲 helper.sh: use -h to display help" 
    fi
    optspec=":hcpf-:"
    # parse opts and set variables printed below while
    while getopts "$optspec" optchar; do
        case "${optchar}" in
            -) # Long options: eg. --help
                case "${OPTARG}" in
                    help)
                        # val="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                        # echo "Parsing option: '--${OPTARG}', value: '${val}'" >&2;
                        Help
                        ;;
                    container-name)
                        containerName="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                        ;;
                    postgres-user)
                        postgresUser="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                        ;;
                    postgres-db-name)
                        postgresDBName="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                        ;;
                    file)
                        file="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                        ;;
                    *)
                        if [ "$OPTERR" = 1 ] && [ "${optspec:0:1}" != ":" ]; then
                            echo -e "🐲 helper.sh: Unknown option --${OPTARG}" >&2
                        fi
                        ;;
                esac;;
            h)
                Help
                exit 2
                ;;
            c)
                containerName="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                ;;
            p)
                postgresUser="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                ;;
            d)
                postgresDBName="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                ;;
            f) 
                file="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                ;;
            *)
                if [ "$OPTERR" != 1 ] || [ "${optspec:0:1}" = ":" ]; then
                    echo -e "🐲 helper.sh: Non-option argument: '-${OPTARG}'" >&2
                fi
                ;;
        esac
    done
}

GetInput()
{
    case $mode in 
    db-applysql) # eg: sh helper.sh db-applysql --container-name project_cold_way_postgres --file 1-schema.sql --postgres-user postgres
        if [[ -n $containerName ]] && [[ -n $postgresUser ]] && [[ -n $file ]]
            then 
            docker exec -it $containerName /bin/bash -c "cd docker-entrypoint-initdb.d && psql -U $postgresUser -f $file && echo '🐲 helper.sh: running sql: ...' && cat $file"
        fi
        ;;
    db-applybackup) # eg: sh helper.sh db-applybackup --container-name project_cold_way_postgres --file '/Users/Jonas/Desktop/dump-project_cold_way-202104181900.sql' --postgres-db-name project_cold_way --postgres-user postgres
        if [[ -n $containerName ]] && [[ -n $postgresDBName ]] && [[ -n $file ]] && [[ -n $postgresUser ]]
            then
            docker cp $file $containerName:/dumpfile
            docker exec -it $containerName /bin/bash -c "pg_restore -U $postgresUser -d $postgresDBName dumpfile"
        fi
        ;;
    up)
        docker compose up
        ;;
    start)
        docker compose start
        echo -e "🐲 helper.sh: application using .env file running on ...
        - ${green}frontend${reset}: http://localhost:3000
        - ${green}auth-service${reset}: http://localhost:4000
        - ${green}socket-service${reset}: http://localhost:4001
        - ${green}cms${reset}: http://localhost:1337/admin
        - ${green}postgresDb${reset}: http://localhost:15432 (postgres, strapi)
        "
        ;;
    stop)
        docker compose stop
        ;;
    setup)
        echo -e "🐲 helper.sh: Setting up dependencies ${green}[socketService]${reset}..."
        cd socketService
        yarn
        cd ..
        echo -e "🐲 helper.sh: Setting up dependencies ${green}[frontend]${reset}..."
        cd frontend
        yarn
        cd ..
        echo -e "🐲 helper.sh: Setting up dependencies ${green}[cms]${reset}..."
        cd cms
        yarn
        cd ..
        echo -e "🐲 helper.sh: Setting up dependencies ${green}[authService]${reset}..."
        cd authService
        yarn
        cd ..
        echo -e "🐲 helper.sh: Setting up ${green}[docker]${reset} containers"
        yarn up
        echo -e "🐲 helper.sh: ${green}Setup successful${reset}..."
        ;;
    *)
        echo -e "🐲 helper.sh: missing mode input, use -h for help"
    ;;
    esac
}

ParseCmdInput() {
    mode=$1   

    if [ $# -gt 1 ]; then
        # shift option away so getOptions has only -options left in $@
        shift 1 
    fi

    GetOptions "$@" # gets all options eg: -* --*
    GetInput "$@" # gets $1 paramers from mode=$1
}

ParseCmdInput "$@"
