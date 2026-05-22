import { UGFClient } from '@tychilabs/ugf-testnet-js';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const CONTRACTS_DIR = path.resolve(__dirname, '../../contracts');
const ENV_PATH = path.resolve(__dirname, '../.env.local');

async function main() {
  console.log('🚀 Starting dynamic UGF deployment...');

  // 1. Fetch UGF Addresses dynamically
  const client = new UGFClient();
  const registry = await client.registry.get();
  
  const mockUsdConfig = registry.payment_options.find((t: any) => t.token === 'TYI_MOCK_USD');
  if (!mockUsdConfig) throw new Error("Could not find TYI_MOCK_USD in UGF Registry");

  const baseSepoliaChain = mockUsdConfig.chains.find((c: any) => c.chain_id === '84532');
  if (!baseSepoliaChain) throw new Error("Could not find Base Sepolia (84532) in TYI_MOCK_USD chains");

  const mockUsdAddress = baseSepoliaChain.address;
  console.log(`✅ Dynamically fetched TYI_MOCK_USD address: ${mockUsdAddress}`);

  // 2. Setup Ethers Provider & Signer
  // Read private key from .env.local if not in process.env
  let privateKey = process.env.PRIVATE_KEY;
  let treasuryAddress = process.env.TREASURY_ADDRESS;
  if (!privateKey && fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
    const pkMatch = envContent.match(/PRIVATE_KEY=(.+)/);
    if (pkMatch) privateKey = pkMatch[1].trim();

    const trMatch = envContent.match(/TREASURY_ADDRESS=(.+)/);
    if (trMatch) treasuryAddress = trMatch[1].trim();
  }

  if (!privateKey) {
    console.error('❌ ERROR: PRIVATE_KEY not found in process.env or .env.local');
    console.error('Please export it or add it to .env.local and try again.');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const wallet = new ethers.Wallet(privateKey, provider);
  const finalTreasury = treasuryAddress || wallet.address;
  console.log(`✅ Using deployer wallet: ${wallet.address}`);
  console.log(`🏦 Treasury Address: ${finalTreasury}`);

  // 3. Compile Contracts using Foundry
  console.log('🔨 Compiling contracts via Foundry...');
  try {
    execSync('forge build', { cwd: CONTRACTS_DIR, stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Foundry compilation failed.');
    process.exit(1);
  }

  // 4. Load Artifacts
  const badgeArtifactPath = path.join(CONTRACTS_DIR, 'out/AchievementBadge.sol/AchievementBadge.json');
  const settlementArtifactPath = path.join(CONTRACTS_DIR, 'out/AuctionSettlement.sol/AuctionSettlement.json');
  
  const badgeArtifact = JSON.parse(fs.readFileSync(badgeArtifactPath, 'utf8'));
  const settlementArtifact = JSON.parse(fs.readFileSync(settlementArtifactPath, 'utf8'));

  // 5. Deploy AchievementBadge
  console.log('⚡ Deploying AchievementBadge...');
  const badgeFactory = new ethers.ContractFactory(badgeArtifact.abi, badgeArtifact.bytecode, wallet);
  const badgeContract = await badgeFactory.deploy(wallet.address);
  await badgeContract.waitForDeployment();
  const badgeAddress = await badgeContract.getAddress();
  console.log(`🎉 AchievementBadge deployed to: ${badgeAddress}`);

  // 6. Generate a random Backend Signer Key
  const backendSignerWallet = ethers.Wallet.createRandom();
  const backendSignerAddress = backendSignerWallet.address;
  const backendSignerPrivateKey = backendSignerWallet.privateKey;
  console.log(`🔐 Generated secure backend signer wallet: ${backendSignerAddress}`);

  // 7. Deploy AuctionSettlement
  console.log('⚡ Deploying AuctionSettlement...');
  const feeBps = 200; // 2% fee
  const settlementFactory = new ethers.ContractFactory(settlementArtifact.abi, settlementArtifact.bytecode, wallet);
  
  const settlementContract = await settlementFactory.deploy(
    wallet.address,           // Owner
    badgeAddress,             // AchievementBadge address
    backendSignerAddress,     // Backend Signer
    finalTreasury,            // Treasury Address
    feeBps                    // Platform fee
  );
  await settlementContract.waitForDeployment();
  const settlementAddress = await settlementContract.getAddress();
  console.log(`🎉 AuctionSettlement deployed to: ${settlementAddress}`);

  // 8. Authorize Settlement Contract to mint badges
  console.log('🔗 Linking AchievementBadge to AuctionSettlement...');
  const badgeInstance = new ethers.Contract(badgeAddress, badgeArtifact.abi, wallet);
  const tx = await badgeInstance.setMinter(settlementAddress);
  await tx.wait();
  console.log('✅ Badges can now be securely minted by the Settlement Contract.');

  // 9. Auto-inject into .env.local
  console.log('📝 Updating .env.local with new contract addresses...');
  let envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';
  
  const envUpdates = {
    NEXT_PUBLIC_SETTLEMENT_CONTRACT: settlementAddress,
    NEXT_PUBLIC_TYI_MOCK_USD: mockUsdAddress,
    BACKEND_SIGNER_PRIVATE_KEY: backendSignerPrivateKey
  };

  for (const [key, value] of Object.entries(envUpdates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  }

  fs.writeFileSync(ENV_PATH, envContent.trim() + '\n');
  console.log('✅ .env.local automatically updated!');
  console.log('🚀 Deployment successfully completed. The app is fully wired up to UGF!');
}

main().catch(console.error);
