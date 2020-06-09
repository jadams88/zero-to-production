const query =
  'query VerifyUser($email: String!, $token: String!){ verify(email: $email, token: $token) { message } }';

export function graphQLVerifyUrl(host: string) {
  return (email: string, token: string) => {
    const variables = {
      email,
      token,
    };

    return `${host}/graphql?query=${escape(query)}&variables=${escape(
      JSON.stringify(variables)
    )}`;
  };
}
