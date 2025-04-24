const signIn = async (username: string, password: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to sign in");
  }

  if (response === undefined) {
    throw new Error("Response is undefined");
  }

  return response;
};

const getUserChats = async (username: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/chats`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        username,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user chats");
  }

  console.log("chats", response);

  return response;
};

type RegisterUser = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
};

const registerUser = async (user: RegisterUser) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to register user");
  }

  return response;
};

const userService = {
  signIn,
  getUserChats,
  registerUser,
};

export default userService;
