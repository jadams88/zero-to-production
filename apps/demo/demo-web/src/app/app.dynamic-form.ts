import { MATERIAL_COMPONENT_MAP } from '@ztp/common/dynamic-form-material-components';
import { CustomUsernameComponent } from '@ztp/common/auth/components';
import { defaultErrorMessages } from '@ztp/common/dynamic-form';

export const APP_COMPONENTS = {
  ...MATERIAL_COMPONENT_MAP,
  USERNAME: CustomUsernameComponent,
};

export const APP_ERRORS = {
  ...defaultErrorMessages,
  missMatchPasswords: 'Passwords do not match',
  doesNotMeetRequirements: 'does note satisfy requirements',
};
