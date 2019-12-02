set -e

SUBSPEC_NAME=""

function usage()
{
	local appName=`basename $0`
	echo "Usage:"
	echo "$appName -s <Subspec Name>"
}

function parseOpts()
{
	while getopts :s: commandLineOpt; do
		case ${commandLineOpt} in
			s)
			    SUBSPEC_NAME=${OPTARG};;
			?)
			    echo "Unknown option '-${OPTARG}'."
			    usage
			    exit 1
		esac
	done

	# Validate that we got the required command line arg(s).
	if [ "${SUBSPEC_NAME}" == "" ]; then
		echo "No option specified for Subspec Name."
		usage
		exit 2
	fi
}

parseOpts "$@"

repoDir=$(cd "$(dirname ${BASH_SOURCE[0]})" && pwd)
publicHeaderDirectory="${TARGET_BUILD_DIR}/${PUBLIC_HEADERS_FOLDER_PATH}"
podSpecFile="${repoDir}/Cordova.podspec"
projectDir=`echo "${PROJECT_DIR}" | sed "s#${repoDir}/##g"`

cd "$repoDir"

# Create the public header file list out of the public headers in the build folder.
publicHeaderFileList=""
isFirstFile=1
for headerFile in `ls -1 "${publicHeaderDirectory}"`; do
	repoHeaderFile=`find ${projectDir} -name $headerFile`
	if [ "$repoHeaderFile" != "" ]; then
		if [ $isFirstFile -eq 1 ]; then
			publicHeaderFileList="'$repoHeaderFile'"
			isFirstFile=0
		else
			publicHeaderFileList=`echo "${publicHeaderFileList}, '$repoHeaderFile'"`
		fi
	fi
done

# Make sure none of the public header files are in the exclude files list
if grep -q "${SUBSPEC_NAME}.exclude_files" ${podSpecFile}
then
    echo "${publicHeaderFileList}" | sed 's/ *//g' | tr , '\n' | sort > "${podSpecFile}.public_header_files_list"
    cat "${podSpecFile}" | grep "${SUBSPEC_NAME}.exclude_files"  | sed 's/.*=//' | sed 's/ *//g' | tr , '\n' | sort > "${podSpecFile}.exclude_files_list"
    publicHeaderFileList=`comm -23 ${podSpecFile}.public_header_files_list ${podSpecFile}.exclude_files_list | tr '\n' , | sed 's/,$//'`
    rm "${podSpecFile}.public_header_files_list" "${podSpecFile}.exclude_files_list"
fi

# Replace the old headers with the new ones.
searchPattern='^( *'"${SUBSPEC_NAME}"'\.public_header_files = ).*$'
replacementPattern='\1'"${publicHeaderFileList}"
sed -E "s#$searchPattern#$replacementPattern#g" "$podSpecFile" > "${podSpecFile}.new"
mv "${podSpecFile}.new" "${podSpecFile}"
