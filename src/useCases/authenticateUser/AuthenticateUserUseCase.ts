import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { client } from "../../prisma/client"

interface IRequest {
  username: string;
  password: string;
}

class AuthenticateUserUseCase {

  async execute({ username, password }: IRequest ) {

    // Verify if user exists
    const userAleradyExists = await client.user.findFirst({
      where: {
        username
      }
    });

    if (!userAleradyExists) {
      throw new Error("User or password incorrect");
    }

    // Verify if password is correct

    const passwordMatch = await compare(password, userAleradyExists.password);

    if (!passwordMatch) {
      throw new Error("User or password incorrect");
    }

    // Generate user token

    const token = sign({}, process.env.JWT_SECRET_KEY, {
      subject: userAleradyExists.id,
      expiresIn: "20s"
    });

    return { token };
  }
}

export { AuthenticateUserUseCase }