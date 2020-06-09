export function restVerifyUrl(host: string) {
  return (email: string, token: string) => {
    return `${host}/authorize/verify?token=${token}&email=${email}`;
  };
}
