import { Request, Response } from "express";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

class AuthenticateUserController {

  async handle(request: Request, response: Response) {
    const { username, password } = request.body;

    const authenticateUserCase = new AuthenticateUserUseCase();

    const token = await authenticateUserCase.execute({
      username, 
      password
    })

    response.json(token);
  }

}

export { AuthenticateUserController };