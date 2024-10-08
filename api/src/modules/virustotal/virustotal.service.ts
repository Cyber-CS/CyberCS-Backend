import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';

const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3/';
const API_KEY =
  '93f447da1a69c632d57d3060f09e98ae4ff338c6b3c81831f9b863ee3459f503'; // Substitua pela sua chave API

@Injectable()
export class VirusTotalService {
  async scanURL(url: string): Promise<any> {
    const endpoint = `${VIRUSTOTAL_API_URL}urls`;
    try {
      const data = qs.stringify({ url });
      const scanResponse = await axios.post(endpoint, data, {
        headers: {
          'x-apikey': API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const analysisId = scanResponse.data.data.id;

      await new Promise((resolve) => setTimeout(resolve, 9000));

      const reportResponse = await this.getReport(analysisId);
      return reportResponse;
    } catch (error) {
      console.error(
        'Error scanning URL:',
        error.response ? error.response.data : error.message,
      );
      throw new Error('Error scanning URL');
    }
  }

  async getReport(analysisId: string): Promise<any> {
    const endpoint = `${VIRUSTOTAL_API_URL}analyses/${analysisId}`;
    try {
      const response = await axios.get(endpoint, {
        headers: {
          'x-apikey': API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        'Error getting report:',
        error.response ? error.response.data : error.message,
      );
      throw new Error('Error getting report');
    }
  }

  async domainInfo(domain: string): Promise<any> {
    const endpoint = `${VIRUSTOTAL_API_URL}domains/${domain}`;
    try {
      const response = await axios.get(endpoint, {
        headers: {
          'x-apikey': API_KEY,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        'Error fetching domain info:',
        error.response ? error.response.data : error.message,
      );
      throw new Error('Error fetching domain info');
    }
  }
}
