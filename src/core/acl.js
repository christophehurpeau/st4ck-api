import aclFactory from './library/acl-factory';
import parameters from '../app/config/parameters';

export default aclFactory({
  groups: parameters.acl.groups,
  profiles: parameters.acl.profiles,
  defaultGroup: parameters.acl.defaultGroup,
});
