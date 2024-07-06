import { useState, useEffect } from "react";
import { client } from "../utils/graphql";
import { GET_TOKENS, GET_TOKEN } from "../utils/query";
import { Address } from "viem";

interface Token {
  id: string;
  address: Address;
  chainId: number;
  creator: Address;
  name: string;
  symbol: string;
  marketCap: string;
  description: string;
  logoUrl: string;
  timestamp: string;
}

interface TokensData {
  tokens: {
    items: Token[];
  };
}

interface TokenDetail extends Token {
  isMigrated: boolean;
  lpAddress: String | null;
}

interface TokenWithPrices extends TokenDetail {
  prices: {
    items: {
      id: number;
      open: string;
      high: string;
      low: string;
      close: string;
      average: string;
      count: string;
    }[];
  };
}

interface TokenData {
  token: TokenWithPrices;
}

export const useTokens = (chainId: number, orderBy: string, limit: number) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async (chainId: number, orderBy: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.request<TokensData>(GET_TOKENS, {
        orderBy,
        chainId,
      });
      setTokens(data.tokens.items);
    } catch (err) {
      console.log(err);
      setError("An Error occured while fetching tokens...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTokens([]);
    fetchTokens(chainId, orderBy);
  }, [chainId, orderBy, limit]);

  return { tokens: tokens, loading, error };
};

export const useToken = (id: string) => {
  const [token, setToken] = useState<TokenWithPrices>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async (id: string) => {
    setLoading(true);
    setError(null);
    if (id == "") {
      setLoading(false);
      return;
    }
    try {
      const data = await client.request<TokenData>(GET_TOKEN, { id });
      setToken(data.token);
    } catch (err) {
      console.log(err);
      setError("An Error occured while fetching tokens...");
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchToken(id);
  };

  useEffect(() => {
    fetchToken(id);
  }, []);

  return { token, loading, error, refetch };
};
