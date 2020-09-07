// eslint-disable-next-line import/extensions
import Paw from '../types-paw-api/paw';
// eslint-disable-next-line import/no-cycle
import EnvironmentManager from './environment-manager';

const makeDv = (type: string, properties?: {[key:string]:any}): DynamicValue => (
  new DynamicValue(type, properties)
);

const makeDs = (...components: Paw.DynamicStringComponent[]): DynamicString => (
  new DynamicString(...components)
);

const makeEnvDv = (variableId: string): DynamicValue => (
  makeDv('com.luckymarmot.EnvironmentVariableDynamicValue', {
    environmentVariable: variableId,
  })
);

const makeRequestDv = (variableId: string): DynamicValue => (
  makeDv('com.luckymarmot.RequestVariableDynamicValue', {
    variableUUID: variableId,
  })
);

const makeFileDv = (): DynamicValue => (
  makeDv('com.luckymarmot.FileContentDynamicValue', {
    bookmarkData: null,
  })
);

const convertEnvString = (
  s: string,
  envManager: EnvironmentManager,
  defaultValue: string = '',
): string|DynamicString => {
  const re = /\{([^}]+)\}/g;
  let match;
  const components: Paw.DynamicStringComponent[] = [];
  let idx = 0;

  // eslint-disable-next-line no-cond-assign
  while (match = re.exec(s)) {
    // push any string here before
    if (match.index > idx) {
      components.push(s.substr(idx, match.index - idx));
    }

    envManager.setEnvironmentVariableValue(match[1], defaultValue);
    // push env variable
    components.push(envManager.getDynamicValue(match[1]));

    idx = match.index + match[0].length;
  }

  // add remaining string
  if (idx < s.length) {
    components.push(s.substr(idx));
  }

  // return
  if (components.length === 0) {
    return '';
  }
  if (components.length === 1 && typeof components[0] === 'string') {
    return components[0];
  }
  return makeDs(...components);
};

export {
  makeDv,
  makeDs,
  makeEnvDv,
  makeRequestDv,
  makeFileDv,
  convertEnvString,
};
