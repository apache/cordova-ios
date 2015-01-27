(function () {
    var fs = require('fs'),
        path = require('path'),
        exec = require('child_process').exec,
        PUSH_NOTIFICATIONS_ENABLED_HEADER_FILE = 'PushNotificationsEnabled.h',
        PUSH_NOTIFICATIONS_ENABLED_HEADER_FILE_CONTENT = '#define PUSH_NOTIFICATIONS_ENABLED ',
        EXPANDED_PROVISIONING_PROFILE = process.env.EXPANDED_PROVISIONING_PROFILE,
        PATH_TO_MOBILE_PROVISIONS = path.join(process.env.HOME, 'Library', 'MobileDevice', 'Provisioning Profiles'),
        PROVISIONING_PROFILE_REQUIRED = process.env.PROVISIONING_PROFILE_REQUIRED,
        PROVISIONING_PROFILE_UUID_REGEX = new RegExp('<key>UUID<\/key>[\\s\\S]*<string>' + EXPANDED_PROVISIONING_PROFILE + '<\/string>');

    function logErrorIfExists(error) {
        if (error !== null) {
            console.error('exec error: ' + error);
        }
    }

    function sanitizeMobileProvision(mobileProvision) {
        if (mobileProvision.indexOf('.mobileprovision') === -1) {
            mobileProvision += '.mobileprovision';
        }

        return mobileProvision;
    }

    function createPushNotificationsEnabledHeaderFile(pushPluginsEnabled) {
        var cordovaEnablePluginHeaderFileLocation = path.join(__dirname, '..', '..', process.env.PROJECT_NAME, 'Classes', PUSH_NOTIFICATIONS_ENABLED_HEADER_FILE);
        fs.writeFileSync(cordovaEnablePluginHeaderFileLocation, PUSH_NOTIFICATIONS_ENABLED_HEADER_FILE_CONTENT + pushPluginsEnabled);
    }

    function createPushNotificationsEnabledHeaderFileWithMobileProvision(mobileProvision) {
        var pathToProvisioningProfile = path.join(PATH_TO_MOBILE_PROVISIONS, sanitizeMobileProvision(mobileProvision));

        exec("security cms -D -i \"" + pathToProvisioningProfile + "\"", function (error, stdout, stderr) {
            logErrorIfExists(error);
            var pushPluginsEnabled = stdout.indexOf("<key>aps-environment</key>") > -1;
            createPushNotificationsEnabledHeaderFile(pushPluginsEnabled);
        });
    }

    function isprovisionUUIDSuitable(provisionContents) {
        return PROVISIONING_PROFILE_UUID_REGEX.test(provisionContents);
    }

    function findValidMobileProvision(provisions) {
        if (provisions.length === 0) {
            console.warn('WARNING: No suitable mobile provision found!');
            return null;
        }

        var currentMobileProvision = provisions[0];
        var currentMobileProvisionPath = path.join(PATH_TO_MOBILE_PROVISIONS, currentMobileProvision);

        exec("security cms -D -i \"" + currentMobileProvisionPath + "\"", function (error, stdout, stderr) {
            logErrorIfExists(error);
            if (isprovisionUUIDSuitable(stdout)) {
                createPushNotificationsEnabledHeaderFileWithMobileProvision(currentMobileProvision);
                return;
            }
            provisions.splice(provisions.indexOf(currentMobileProvision), 1);
            findValidMobileProvision(provisions);
        });
    }

    function getMobileProvisions() {
        return fs.readdirSync(PATH_TO_MOBILE_PROVISIONS);
    }

    if (PROVISIONING_PROFILE_REQUIRED) {
        var mobileProvisions = getMobileProvisions();
        if (mobileProvisions.length === 0) {
            console.warn('WARNING: No mobile provisions found!');
            return this;
        }

        if (mobileProvisions.indexOf(sanitizeMobileProvision(EXPANDED_PROVISIONING_PROFILE)) !== -1) {
            createPushNotificationsEnabledHeaderFileWithMobileProvision(EXPANDED_PROVISIONING_PROFILE);
            return this;
        }

        findValidMobileProvision(mobileProvisions);
    } else {
        createPushNotificationsEnabledHeaderFile(true);
    }
}());