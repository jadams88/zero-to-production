export function restVerifyUrl(host: string) {
  return (email: string, token: string) => {
    return `${host}/verify?token=${token}&email=${email}`;
  };
}
