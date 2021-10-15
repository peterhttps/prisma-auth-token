import { client } from "../../prisma/client"
import { GenerateTokenProvider } from "../../provider/GenerateTokenProvider";
import dayjs from 'dayjs';
import { GenerateRefreshToken } from "../../provider/GenerateRefreshToken";

class RefreshTokenUserUseCase {

  async execute(refresh_token: string) {
    
    const refreshToken = await client.refreshToken.findFirst({
      where: {
        id: refresh_token
      }
    });

    if (!refreshToken) {
      throw new Error ("Refresh token invalid");
    }

    const refreshTokenExpired = dayjs().isAfter(dayjs.unix(refreshToken.expiresIn));

    const generateTokenProvider = new GenerateTokenProvider();
    const token = await generateTokenProvider.execute(refreshToken.userId);


    if (refreshTokenExpired) {
      await client.refreshToken.deleteMany({
        where: {
          userId: refreshToken.userId
        }
      });

      const generateRefreshTokenProvider = new GenerateRefreshToken();
      const newRefreshToken = await generateRefreshTokenProvider.execute(refreshToken.userId);
      return { refreshToken: newRefreshToken };
    }
  
    return { token };
  }
}

export {RefreshTokenUserUseCase} 