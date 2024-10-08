import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HIBPService {
  private readonly HIBP_API_URL = 'https://haveibeenpwned.com/api/v3';
  private readonly API_KEY = '22ba4b3e24214732b8e21b5aa6b16627'; // Substitua pela sua chave de API válida

  async checkBreachedAccount(email: string): Promise<any> {
    if (!email) {
      throw new HttpException('E-mail não informado.', 400);
    }

    const endpoint = `${this.HIBP_API_URL}/breachedaccount/${email}`;
    console.log(`Consultando API com email: ${email}`); // Log para depuração

    try {
      const response = await axios.get(endpoint, {
        headers: {
          'hibp-api-key': this.API_KEY,
          'User-Agent': 'NestJS App',
        },
        params: {
          truncateResponse: false, // Resposta completa
        },
      });

      console.log('Resposta da API HIBP:', response.data); // Log da resposta da API

      if (response.data && response.data.length > 0) {
        return {
          status: 'vazado',
          breaches: response.data.map((breach: any) => ({
            name: breach.Name,
            title: breach.Title,
            domain: breach.Domain,
            date: breach.BreachDate,
            description: breach.Description,
            compromisedData: breach.CompromisedData,
            logo: breach.LogoPath || '', // Garantir que não falhe se não houver logo
          })),
        };
      } else {
        return { status: 'não vazado' };
      }
    } catch (error: any) {
      console.error('Erro ao consultar a API HIBP:', error); // Log para erro

      if (error.response) {
        console.error('Detalhes do erro:', error.response.data); // Log dos detalhes do erro
        // Tratar o caso de limite de requisições
        if (error.response.status === 429) {
          throw new HttpException(
            'Muitas requisições em pouco tempo. Tente novamente mais tarde.',
            429,
          );
        }
        // Tratar o caso de e-mail não encontrado
        if (error.response.status === 404) {
          return { status: 'não vazado' };
        }
      }

      throw new HttpException('Erro ao conectar com a API HIBP.', 500);
    }
  }
}
