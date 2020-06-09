import { isPasswordAllowed, stripPasswordFields } from './utils';

describe('Authentication Utils', () => {
  describe('isPasswordAllowed', () => {
    const allowedPasswords = ['adf#jf3@#FD!'];
    const disallowedPasswords = [
      '',
      'fffffffffff',
      '8888888888',
      'password',
      'badPassword',
      'asF.s0f.s',
    ];

    allowedPasswords.forEach((pwd) => {
      it(`${pwd} should be allowed`, () => {
        expect(isPasswordAllowed(pwd)).toBe(true);
      });
    });
    disallowedPasswords.forEach((pwd) => {
      it(`${pwd} should not be allowed`, () => {
        expect(isPasswordAllowed(pwd)).toBe(false);
      });
    });
  });

  describe('stripPasswordFields', () => {
    it('should exclude secure properties', () => {
      const safeUser = {
        id: 'abd123',
        username: 'user1',
        givenName: 'Some',
        surname: 'User',
        email: 'user@user.com',
        dateOfBirth: '2019-01-01',
      };

      const user = {
        ...safeUser,
        password: 'unhashedPassword',
        hashedPassword: 'some really long hash',
      };

      const filteredUser = stripPasswordFields(user);

      expect(filteredUser.id).toEqual(user.id);
      expect(filteredUser.username).toBeDefined();

      expect(filteredUser.hashedPassword).not.toBeDefined();
      expect(filteredUser).toEqual(safeUser);
    });
  });
});
