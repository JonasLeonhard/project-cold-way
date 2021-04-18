#!bash

Help()
{
   # Display Help
   echo "
   🐲 helper.sh:
   Syntax: scriptTemplate [-h | db-applysql]
   options
   h                Print this Help.
   db-applysql      Apply .sql file in docker-entrypoint-initdb.d/ to --container-name as --postgres-user
                    -c | --container-name (postgresql container name)
                    -p | --postgres-user  (psql database user)
                    -s | --schema         (schema file in postgres docker-entrypoint-initdb.d/ directory)
    up              Build the app by using docker compose up
    start           Start the app by using docker compose up -d
    stop            Stop the app by using docker compose stop
   "
}

GetOptions()
{
    if [ getopts ] # false = no opts given
    then
        echo "🐲 helper.sh: use -h to display help" 
    fi
    optspec=":hcps-:"
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
                    schema)
                        schema="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                        ;;
                    *)
                        if [ "$OPTERR" = 1 ] && [ "${optspec:0:1}" != ":" ]; then
                            echo "🐲 helper.sh: Unknown option --${OPTARG}" >&2
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
            s) 
                schema="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                ;;
            *)
                if [ "$OPTERR" != 1 ] || [ "${optspec:0:1}" = ":" ]; then
                    echo "🐲 helper.sh: Non-option argument: '-${OPTARG}'" >&2
                fi
                ;;
        esac
    done
}

GetInput()
{
    case $1 in 
    db-applysql) # eg: sh helper.sh db-applysql --container-name project_cold_way_postgres --schema 1-schema.sql --postgres-user postgres
        if [ -n $containerName ] && [ -n $postgresUser ] && [ -n $schema ]
            then 
            docker exec -it $containerName /bin/bash -c "cd docker-entrypoint-initdb.d && psql -U $postgresUser -f $schema && echo '🐲 helper.sh: running sql: ...' && cat $schema"
        fi
        ;;
    up)
        docker compose up
        ;;
    start)
        docker compose up -d
        ;;
    stop)
        docker compose stop
        ;;
    *)
        echo "🐲 helper.sh: missing mode input, use -h for help"
    ;;
    esac
}

GetOptions "$@"
GetInput "$@"


