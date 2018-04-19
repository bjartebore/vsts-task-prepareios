let tl = require('vsts-task-lib');
let Xcode = require('xcode-node').default;

const run = () => {
  try {
    // Get all variables
    const configuration = tl.getInput('ConfigurationName', true);
    const filePathGlob = tl.getInput('FilePath', true);
    const productBundleIdentifier = tl.getInput('ProductBundleIdentifier', true);
    const productName = tl.getInput('ProductName', true);
    const developmentTeam = tl.getInput('DevelopmentTeam', true);
    const targetName = tl.getInput('TargetName', true);
    const ensureProvisioningStyleManual = tl.getBoolInput('ensureProvisioningStyleManual');
    const signingIdentity = tl.getInput('signingIdentity', false);
    const provisioningProfileUUID = tl.getInput('provisioningProfileUUID', false);
    // Paths
    const workingDir = tl.getPathInput('cwd');
    const fileMatches = tl.findMatch(
      workingDir,
      filePathGlob,
      {
        followSymbolicLinks: false,
        followSpecifiedSymbolicLink: false,
      });
    // modify project files
    fileMatches.forEach((path) => {
      const project = new Xcode(path);
      project.getTargets().forEach((target) => {

        if (target.name !== targetName) {
          tl.debug(`Target: ${target.name} not matching configured target: ${targetName}`);
          return;
        }

        console.log(`Configuring PRODUCT_BUNDLE_IDENTIFIER: ${productBundleIdentifier} for target: ${target.name}`)
        project.configuration.setUserDefinedTargetConfiguration(
          target.name,
          configuration,
          'PRODUCT_BUNDLE_IDENTIFIER',
          productBundleIdentifier);

        console.log(`Configuring PRODUCT_NAME: ${productName} for target: ${target.name}`)
        project.configuration.setUserDefinedTargetConfiguration(
          target.name,
          configuration,
          'PRODUCT_NAME',
          productName);

        console.log(`Configuring DEVELOPMENT_TEAM: ${developmentTeam} for target: ${target.name}`)
        project.configuration.setUserDefinedTargetConfiguration(
          target.name,
          configuration,
          'DEVELOPMENT_TEAM',
          developmentTeam);

        if (signingIdentity !== "") {
          tl.debug(`Configuring CODE_SIGN_IDENTITY: ${signingIdentity} for target: ${target.name}`)
          project.configuration.setUserDefinedTargetConfiguration(
            target.name,
            configuration,
            'CODE_SIGN_IDENTITY',
            signingIdentity);
        }

        if(ensureProvisioningStyleManual) {
          tl.debug(`Configuring CODE_SIGN_STYLE: Manual for target: ${target.name}`)
          project.configuration.setUserDefinedTargetConfiguration(
            target.name,
            configuration,
            'CODE_SIGN_STYLE',
            'Manual');
        }

        if (provisioningProfileUUID !== "") {
          tl.debug(`Configuring PROVISIONING_PROFILE: ${provisioningProfileUUID} for target: ${target.name}`)
          project.configuration.setUserDefinedTargetConfiguration(
            target.name,
            configuration,
            'PROVISIONING_PROFILE',
            provisioningProfileUUID);

          tl.debug(`Configuring PROVISIONING_PROFILE_SPECIFIER: '' for target: ${target.name}`)
          project.configuration.setUserDefinedTargetConfiguration(
            target.name,
            configuration,
            'PROVISIONING_PROFILE_SPECIFIER',
            '');

        }

      });

      if(ensureProvisioningStyleManual) {
        tl.debug('Ensures that ProvisionStyle is set to Manual');
        project.myProj.addTargetAttribute('ProvisioningStyle', 'Manual');
      }

      project.save();
    });
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err);
  }
};

run();
