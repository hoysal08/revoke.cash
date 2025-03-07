import ky from 'lib/ky';
import {
  CHAIN_SELECT_MAINNETS,
  getChainDeployedContracts,
  getChainName,
  getChainPriceStrategy,
} from 'lib/utils/chains';

const getChainOrder = async () => {
  const multicallData = await ky
    .get('https://raw.githubusercontent.com/mds1/multicall/main/deployments.json')
    .json<any[]>();
  const llamaData = await ky.get('https://api.llama.fi/chains').json<any[]>();
  const chains = CHAIN_SELECT_MAINNETS.map((chainId) => {
    const chainData = llamaData.find(
      (chain) =>
        chain.chainId === chainId ||
        chain.name?.toLowerCase() === getChainName(chainId)?.toLowerCase() ||
        chain.gecko_id === getChainName(chainId).toLowerCase(),
    );
    return [getChainName(chainId), chainId, Math.round(chainData?.tvl ?? 0)] as const;
  });

  chains.sort(([, , a], [, , b]) => b - a);

  chains.forEach(([chainName, chainId, tvl], index) => {
    const hasPriceStrategyIcon = getChainPriceStrategy(chainId) ? '✅' : '❌';
    const indexDiff = String(index - CHAIN_SELECT_MAINNETS.indexOf(chainId))
      .padStart(3, ' ')
      .padEnd(4, ' ');
    console.log(hasPriceStrategyIcon, indexDiff, chainName.padEnd(18), tvl);

    if (multicallData.find((data) => data.chainId === chainId) && !getChainDeployedContracts(chainId)) {
      console.log('>>>>>>>>>>>> ADD MULTICALL');
    }
  });

  console.log();
  console.log('Total chains:', chains.length);
};

getChainOrder();
