import fs from 'fs';
import { IApi } from '@umijs/types';
import { init, setOptions } from '../../context';

const UMI_LIKE_PKGS = ['umi', '@alipay/bigfish'];

/**
 * dumi prepare plugin
 */
export default (api: IApi) => {
  const deps = Object.assign({}, api.pkg.dependencies, api.pkg.devDependencies);
  // enable ingetrate mode if dumi was registered as a umi preset on a umi like project
  const isIntegrateUmi =
    UMI_LIKE_PKGS.some(pkg => deps[pkg]) &&
    deps['@umijs/preset-dumi'] &&
    // also can force disable integrate mode by umi build --dumi
    api.args?.dumi === undefined;

  // init context & share umi api with other source module
  init(api, { isIntegrate: isIntegrateUmi } as any);

  // use modifyConfig api for update context
  // because both of the umi service init & user config changed will trigger this plugin key
  api.modifyConfig(memo => {
    // share config with other source module via context
    setOptions('title', memo.title || api.pkg.name || 'dumi');

    return {
      ...memo,
      // pass empty routes if pages path does not exist and no routes config
      // to avoid umi throw src directory not exists error
      routes: fs.existsSync(api.paths.absSrcPath) && !api.userConfig.routes ? undefined : [],
    };
  });
};
