#!bash

Help() {
    echo "
    🐲 helper.sh -h (help): 
    (-h):       displays this help message
    (build:antd): 
                compiling a list of .less styles of components in ./antd.components.config to ./public/styles/ant.css
   "
}

GetOptions()
{
    if [ getopts ] # true = no opts given
    then
        echo "🐲 helper.sh: use -h to display help" 
    fi
    optspec=":h-:"
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
            *)
                if [ "$OPTERR" != 1 ] || [ "${optspec:0:1}" = ":" ]; then
                    echo "🐲 helper.sh: Non-option argument: '-${OPTARG}'" >&2
                fi
                ;;
        esac
    done
}

GetInput() {
    case $mode in 
        build:antd) # eg: sh helper.sh build:antd
            if [ -n $containerName ] && [ -n $postgresUser ] && [ -n $file ]
                then 
                RenderAntd
            fi
            ;;
        *)
            echo "🐲 helper.sh: missing mode input, use -h for help"
        ;;
    esac
}

RenderAntd() {
    #? change this to set your own custom theme!
    modifyVars=$(printf '%s' "
    --modify-var=@primary-color=#1C7C54 
    --modify-var=@border-radius-base=3px
    ")

    echo "🐲 ... building styling with theme: modify-vars: $modifyVars"

    outputFilePath=./public/styles/ant.min.css

    # clean ant.css file
    rm ./public/styles/ant.min.css && touch ./public/styles/ant.min.css

    ## compile components in antd.components.import
    for n in $(cat antd.components.config )
    do
        echo "🐲 $n ... adding antd component to public/styles/ant.css"

        inputFilePath=$n
        
        # | sed 1,2d | sed '$d'
        # append compiled file to $outputFilePath file, remove first two lines of yarn + path
        yarn lessc --js $modifyVars $inputFilePath | sed 1,1d >> $outputFilePath
    done

    ## minify styles
    yarn uglifycss ./public/styles/ant.min.css --output ./public/styles/ant.min.css
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