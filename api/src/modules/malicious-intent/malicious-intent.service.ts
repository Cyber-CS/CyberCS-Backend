import { Injectable } from '@nestjs/common';

interface PatternInfo {
  pattern: RegExp;
  name: string;
  description: string;
}

@Injectable()
export class MaliciousIntentService {
  private suspiciousKeywords = [
    'roubo',
    'fraude',
    'clonagem',
    'phishing',
    'pharming',
    'ransomware',
    'malware',
    'spyware',
    'trojan',
    'trojan horse',
    'cavalo de troia',
    'cavalo de tróia',
    'tráfico de dados',
    'vazamento de dados',
    'vazamento de informações',
    'vazamento de dados pessoais',
    'vazamento de informações pessoais',
    'vazamento de dados sensíveis',
    'vazamento de informações sensíveis',
    'vazamento de dados bancários',
    'vazamento de informações bancárias',
    'vazamento de dados financeiros',
    'data leak',
    'information leak',
    'data breach',
    'information breach',
    'exposure',
    'data exposure',
    'sql injection',
    'xss',
    'cross-site scripting',
    'csrf',
    'ssrf',
    'remote code execution',
    'rce',
    'brute force',
    'ddos',
    'denial of service',
    'command and control',
    'c2',
    'botnet',
    'exploit',
    'buffer overflow',
    'heap overflow',
    'stack overflow',
    'integer overflow',
    'format string',
    'shellcode',
    'zero day',
    '0day',
    'backdoor',
    'rootkit',
    'keylogger',
    'credential stuffing',
    'password',
    'senha',
    'ssn',
    'credit card',
    'cartão de crédito',
    'bank account',
    'account number',
    'account no',
    'routing number',
    'número de conta',
    'cnpj',
    'cpf',
    'rg',
    'private key',
    'secret key',
    'api key',
    'access token',
    'jwt',
    'oauth',
    'social security number',
    'nid',
    'personal data',
    'sensitive data',
    'financial data',
    'health data',
    'medical data',
    'credit information',
    'credit report',
    'address',
    'phone number',
    'email address',
    'birth date',
    'dob',
    'birth certificate',
    'gdpr',
    'lgpd',
    'hipaa',
    'pci dss',
    'sox',
    'ferpa',
    'cobit',
    'iso 27001',
  ];

  private regexPatterns: PatternInfo[] = [
    {
      pattern:
        /('.*(--|;)|".*(--|;)|;--|' OR \d+=\d| OR \d+=\d|UNION SELECT|SELECT .+ FROM .+|DROP TABLE|INSERT INTO)/i,
      name: 'sqlInjection',
      description: 'Injeção de SQL',
    },
    {
      pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
      name: 'jsInjection',
      description: 'Injeção de JavaScript',
    },
    {
      pattern:
        /(alert\s*\(.*\)|onload\s*=\s*.*|onerror\s*=\s*.*|<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>)/i,
      name: 'exploitIndicators',
      description: 'Indicadores de exploração',
    },
    // {
    //   pattern: /\b\w+\.(exe|sh|bat|cmd|scr|pif|php|asp|aspx|jsp)\b/i,
    //   name: 'suspiciousExtensions',
    // },
    // {
    //   pattern:
    //     /(powershell\s+-[nN]o[pP]rofile\s+-[eE]xecutionpolicy\s+[bypass|unrestricted]\s+-[fF]ile\s+.*)/i,
    //   name: 'powerShell',
    // },
    // {
    //   pattern:
    //     /(useradd\s+|adduser\s+|net\s+user\s+|dsadd\s+user\s+|dsmod\s+user\s+)/i,
    //   name: 'userCreation',
    // },
    // {
    //   pattern:
    //     /(nmap\s+|hydra\s+|john\s+|metasploit\s+|msfconsole\s+|aircrack-ng\s+)/i,
    //   name: 'hackingTools',
    // },
    // {
    //   pattern: /(ms[0-9]{2}-[0-9]{3}|cve-[0-9]{4}-[0-9]{4,5})/i,
    //   name: 'commonExploits',
    // },
    // {
    //   pattern: /(ftp\s+-[sS]:|sftp\s+-[oO]|scp\s+-[oO])/i,
    //   name: 'fileUpload',
    // },
    // {
    //   pattern: /(eval\(|unescape\(|fromCharCode\(|atob\(|btoa\()/i,
    //   name: 'obfuscation',
    // },
    {
      pattern: /\b(?:\d[ -]*?){13,16}\b/,
      name: 'creditCard',
      description: 'Cartão de crédito possivelmente encontrado',
    },
    {
      pattern: /\b\(?\d{2}\)?\s?\d{4,5}-\d{4}\b/,
      name: 'phoneNumber',
      description: 'Número de telefone possivelmente encontrado',
    },
    {
      pattern: /\b(pass|senha|password)\b\s*[:=]\s*\S+/i,
      name: 'commonPasswords',
      description: 'Senha possivelmente encontrada',
    },
    // {
    //   pattern: /\b\d{4,6}-?\d{2,4}\b/,
    //   name: 'bankAccount',
    // },
    {
      pattern: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/,
      name: 'cpf',
      description: 'CPF possivelmente encontrado',
    },
    {
      pattern: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/,
      name: 'cnpj',
      description: 'CNPJ possivelmente encontrado',
    },
    {
      pattern: /\bAccess\s*Code:\s*\w{5,10}\b/,
      name: 'accessCode',
      description: 'Código de acesso possivelmente encontrado',
    },
    {
      pattern: /\b(API_KEY|SECRET_KEY|PASSWORD|ACCESS_TOKEN|PRIVATE_KEY)\b/i,
      name: 'envVariable',
      description: 'Variável de ambiente sensível possivelmente encontrada',
    },
    {
      pattern:
        /\b(aws_access_key_id|aws_secret_access_key|aws_session_token)\b/i,
      name: 'awsCredentials',
      description: 'Credenciais da AWS possivelmente encontradas',
    },
    {
      pattern:
        /\b(azure_client_id|azure_client_secret|azure_tenant_id|azure_subscription_id)\b/i,
      name: 'azureCredentials',
      description: 'Credenciais da Azure possivelmente encontradas',
    },
    {
      pattern:
        /\b(gcp_project_id|gcp_private_key_id|gcp_private_key|gcp_client_email|gcp_client_id|gcp_auth_uri|gcp_token_uri|gcp_auth_provider_x509_cert_url|gcp_client_x509_cert_url)\b/i,
      name: 'gcpCredentials',
      description: 'Credenciais da GCP possivelmente encontradas',
    },
    {
      pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
      name: 'ipAddress',
      description: 'Endereço de IP possivelmente encontrado',
    },
    {
      pattern: /\b(unescape\(|fromCharCode\(|eval\(|Function\()/i,
      name: 'obfuscatedCode',
      description: 'Código ofuscado possivelmente encontrado',
    },
    {
      pattern: /\b(MSF|Metasploit|exploit-db|CVE-\d{4}-\d{4,5})\b/i,
      name: 'exploitReference',
      description: 'Referência a exploit possivelmente encontrada',
    },
  ];

  private contextCheck(code: string, keyword: string): boolean {
    const contextWindow = 50;
    const regex = new RegExp(
      `.{0,${contextWindow}}${keyword}.{0,${contextWindow}}`,
      'i',
    );
    return regex.test(code);
  }

  async checkForMaliciousIntent(code: string): Promise<any[]> {
    const matches = [];

    for (const { pattern, name, description } of this.regexPatterns) {
      const match = code.match(pattern);
      if (match) {
        const contextMatch = this.suspiciousKeywords.some((keyword) =>
          this.contextCheck(code, keyword),
        );

        if (contextMatch) {
          matches.push({
            type: name,
            match: match[0],
            description: description,
          });
        } else {
          matches.push({
            type: name,
            match: match[0],
            description: description,
          });
        }
      }
    }
    return matches;
  }
}
