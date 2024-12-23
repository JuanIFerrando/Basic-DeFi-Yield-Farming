// SPDX-License-Identifier: MIT
// author: JuanIFerrando

import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Owner address: ${deployer.address}`);

  // Desplegar el contrato LPToken
  console.log("Deploying LPToken...");
  const LPToken = await ethers.getContractFactory("LPToken");
  const lpToken = await LPToken.deploy(deployer.address); // El constructor requiere la dirección del owner
  await lpToken.waitForDeployment();
  const lpTokenAddress = lpToken.target; // target reemplaza 'address' en ethers.js v6
  console.log("LPToken deployed to:", lpTokenAddress);

  // Desplegar el contrato DAppToken
  console.log("Deploying DAppToken...");
  const DAppToken = await ethers.getContractFactory("DAppToken");
  const dAppToken = await DAppToken.deploy(deployer.address);
  await dAppToken.waitForDeployment();
  const dAppTokenAddress = dAppToken.target;
  console.log("DAppToken deployed to:", dAppTokenAddress);

  // Desplegar el contrato TokenFarm utilizando las direcciones obtenidas
  console.log("Deploying TokenFarm...");
  const TokenFarm = await ethers.getContractFactory("TokenFarm");
  const tokenFarm = await TokenFarm.deploy(dAppTokenAddress, lpTokenAddress);
  await tokenFarm.waitForDeployment();
  const tokenFarmAddress = tokenFarm.target;
  console.log("TokenFarm deployed to:", tokenFarmAddress);

  // Opcional: Guardar las direcciones en un archivo o mostrarlas como referencia
  console.log("\n--- Deployed Contract Addresses ---");
  console.log(`LPToken Address: ${lpTokenAddress}`);
  console.log(`DAppToken Address: ${dAppTokenAddress}`);
  console.log(`TokenFarm Address: ${tokenFarmAddress}`);
}

// Manejo de errores
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
