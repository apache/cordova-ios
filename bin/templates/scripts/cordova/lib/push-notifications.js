(function () {
    var fs = require('fs'),
        path = require('path'),
        exec = require('child_process').exec,
        PUSH_NOTIFICATIONS_ENABLED_HEADER_FILE = 'PushNotificationsEnabled.h',
        PUSH_NOTIFICATIONS_ENABLED_HEADER_FILE_CONTENT = '#define PUSH_NOTIFICATIONS_ENABLED ',
        EXPANDED_PROVISIONING_PROFILE = process.env.EXPANDED_PROVISIONING_PROFILE,
        PATH_TO_MOBILE_PROVISIONS = path.join(process.env.HOME, 'Library', 'MobileDevice', 'Provisioning Profiles'),
        PATH_TO_MOBILE_PUSH_NOTIFICATIONS_ENABLED_HEADER_FILE = path.join(process.env.PROJECT_DIR, process.env.PROJECT_NAME, 'Classes', PUSH_NOTIFICATIONS_ENABLED_HEADER_FILE),
        PROVISIONING_PROFILE_REQUIRED = process.env.PROVISIONING_PROFILE_REQUIRED,
        PROVISIONING_PROFILE_UUID_REGEX = new RegExp('<key>UUID<\/key>[\\s\\S]*<string>' + EXPANDED_PROVISIONING_PROFILE + '<\/string>');

    function logErrorIfExists(error) {
        if (error) {
            console.error('ERROR: ' + error);
        }
    }

    function sanitizeMobileProvision(mobileProvision) {
        if (mobileProvision.indexOf('.mobileprovision') === -1) {
            mobileProvision += '.mobileprovision';
        }

        return mobileProvision;
    }

    function createPushNotificationsEnabledHeaderFile(hasPushNotificationsEntitlement) {
        fs.writeFileSync(PATH_TO_MOBILE_PUSH_NOTIFICATIONS_ENABLED_HEADER_FILE, PUSH_NOTIFICATIONS_ENABLED_HEADER_FILE_CONTENT + hasPushNotificationsEntitlement);
    }

    function createPushNotificationsEnabledHeaderFileWithMobileProvision(mobileProvision) {
        var pathToProvisioningProfile = path.join(PATH_TO_MOBILE_PROVISIONS, sanitizeMobileProvision(mobileProvision));

        exec("security cms -D -i \"" + pathToProvisioningProfile + "\"", function (error, stdout, stderr) {
            logErrorIfExists(error);
            var hasPushNotificationsEntitlement = stdout.indexOf("<key>aps-environment</key>") > -1;
            createPushNotificationsEnabledHeaderFile(hasPushNotificationsEntitlement);
        });
    }

    function isProvisionUUIDSuitable(provisionContents) {
        return PROVISIONING_PROFILE_UUID_REGEX.test(provisionContents);
    }

    function findValidMobileProvision(provisions, errorCallback, successCallback) {
        if (provisions.length === 0) {
            return errorCallback('No suitable mobile provision found!');
        }

        var currentMobileProvision = provisions[0];
        var currentMobileProvisionPath = path.join(PATH_TO_MOBILE_PROVISIONS, currentMobileProvision);

        exec("security cms -D -i \"" + currentMobileProvisionPath + "\"", function (error, stdout, stderr) {
            logErrorIfExists(error);
            if (isProvisionUUIDSuitable(stdout)) {
                return successCallback(currentMobileProvision);
            }
            provisions.splice(0, 1);
            findValidMobileProvision(provisions, errorCallback, successCallback);
        });
    }

    function getMobileProvisions() {
        return fs.readdirSync(PATH_TO_MOBILE_PROVISIONS);
    }

    if (PROVISIONING_PROFILE_REQUIRED) {
        var mobileProvisions = getMobileProvisions();
        if (mobileProvisions.length === 0) {
            return logErrorIfExists('No mobile provisions found!');
        }

        if (mobileProvisions.indexOf(sanitizeMobileProvision(EXPANDED_PROVISIONING_PROFILE)) !== -1) {
            createPushNotificationsEnabledHeaderFileWithMobileProvision(EXPANDED_PROVISIONING_PROFILE);
            return this;
        }

        findValidMobileProvision(mobileProvisions, logErrorIfExists, createPushNotificationsEnabledHeaderFileWithMobileProvision);
    } else {
        createPushNotificationsEnabledHeaderFile(true);
    }
}());