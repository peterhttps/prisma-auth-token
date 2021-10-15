import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { client } from "../../prisma/client"
import { GenerateRefreshToken } from '../../provider/GenerateRefreshToken';
import { GenerateTokenProvider } from '../../provider/GenerateTokenProvider';

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
    const generateTokenProvider = new GenerateTokenProvider();
    const token = await generateTokenProvider.execute(userAleradyExists.id);

    await client.refreshToken.deleteMany({
      where: {
        userId: userAleradyExists.id
      }
    });

    const generateRefreshToken = new GenerateRefreshToken();
    const refreshToken = await generateRefreshToken.execute(userAleradyExists.id);

    return { token, refreshToken };
  }
}

export { AuthenticateUserUseCase }