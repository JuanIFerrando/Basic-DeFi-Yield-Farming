// SPDX-License-Identifier: MIT
// author: JuanIFerrando

import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenFarm", function () {
  let dappToken: any;
  let lpToken: any;
  let tokenFarm: any;

  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Desplegar contratos
    const DAppToken = await ethers.getContractFactory("DAppToken");
    dappToken = await DAppToken.deploy(owner.address);

    const LPToken = await ethers.getContractFactory("LPToken");
    lpToken = await LPToken.deploy(owner.address);

    const TokenFarm = await ethers.getContractFactory("TokenFarm");
    tokenFarm = await TokenFarm.deploy(dappToken.address, lpToken.address);

    // Transferir propiedad de DAppToken a TokenFarm
    await dappToken.transferOwnership(tokenFarm.address);
  });

  it("Debería permitir acuñar tokens LP y depositarlos", async function () {
    await lpToken.mint(addr1.address, 1000);
    await lpToken.connect(addr1).approve(tokenFarm.address, 500);

    await tokenFarm.connect(addr1).deposit(500);
    const stakingInfo = await tokenFarm.stakingInfo(addr1.address);

    expect(stakingInfo.stakingBalance).to.equal(500);
    expect(stakingInfo.isStaking).to.be.true;
  });

  it("Debería calcular y distribuir recompensas correctamente", async function () {
    await lpToken.mint(addr1.address, 1000);
    await lpToken.connect(addr1).approve(tokenFarm.address, 500);
    await tokenFarm.connect(addr1).deposit(500);

    // Simular paso del tiempo
    await ethers.provider.send("evm_increaseTime", [600]); // 600 segundos
    await ethers.provider.send("evm_mine", []); // Minar un bloque

    await tokenFarm.distributeRewardsAll();

    const stakingInfo = await tokenFarm.stakingInfo(addr1.address);
    expect(stakingInfo.pendingRewards).to.be.gt(0);
  });

  it("Debería permitir reclamar recompensas acumuladas", async function () {
    await lpToken.mint(addr1.address, 1000);
    await lpToken.connect(addr1).approve(tokenFarm.address, 500);
    await tokenFarm.connect(addr1).deposit(500);

    // Simular paso del tiempo
    await ethers.provider.send("evm_increaseTime", [600]);
    await ethers.provider.send("evm_mine", []);

    await tokenFarm.distributeRewardsAll();
    const initialDappBalance = await dappToken.balanceOf(addr1.address);

    await tokenFarm.connect(addr1).claimRewards();
    const finalDappBalance = await dappToken.balanceOf(addr1.address);

    expect(finalDappBalance).to.be.gt(initialDappBalance);
  });

  it("Debería permitir retirar tokens LP y reclamar recompensas pendientes", async function () {
    await lpToken.mint(addr1.address, 1000);
    await lpToken.connect(addr1).approve(tokenFarm.address, 500);
    await tokenFarm.connect(addr1).deposit(500);

    // Simular paso del tiempo
    await ethers.provider.send("evm_increaseTime", [600]);
    await ethers.provider.send("evm_mine", []);

    await tokenFarm.distributeRewardsAll();
    await tokenFarm.connect(addr1).withdraw();

    const stakingInfo = await tokenFarm.stakingInfo(addr1.address);
    expect(stakingInfo.stakingBalance).to.equal(0);
    expect(stakingInfo.isStaking).to.be.false;
  });

  it("Debería cobrar una tarifa al reclamar recompensas", async function () {
    await lpToken.mint(addr1.address, 1000);
    await lpToken.connect(addr1).approve(tokenFarm.address, 500);
    await tokenFarm.connect(addr1).deposit(500);

    // Simular paso del tiempo
    await ethers.provider.send("evm_increaseTime", [600]);
    await ethers.provider.send("evm_mine", []);

    await tokenFarm.distributeRewardsAll();

    const initialOwnerBalance = await dappToken.balanceOf(owner.address);
    await tokenFarm.connect(addr1).claimRewards();
    const finalOwnerBalance = await dappToken.balanceOf(owner.address);

    expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
  });
});
