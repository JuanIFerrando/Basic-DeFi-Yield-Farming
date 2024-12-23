// SPDX-License-Identifier: MIT
// author: JuanIFerrando

import { expect } from "chai";
import { ethers } from "hardhat";

describe("DAppToken and LPToken", function () {
  let owner: any;
  let addr1: any;
  let dappToken: any;
  let lpToken: any;

  before(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Desplegar el contrato DAppToken
    const DAppToken = await ethers.getContractFactory("DAppToken");
    dappToken = await DAppToken.deploy(owner.address);

    // Desplegar el contrato LPToken
    const LPToken = await ethers.getContractFactory("LPToken");
    lpToken = await LPToken.deploy(owner.address);
  });

  describe("DAppToken", function () {
    it("Debería inicializarse con el propietario correcto", async function () {
      expect(await dappToken.owner()).to.equal(owner.address);
    });

    it("Debería permitir acuñar y transferir tokens", async function () {
      // Acuñar tokens
      await dappToken.mint(addr1.address, 100);
      expect(await dappToken.balanceOf(addr1.address)).to.equal(100);

      // Transferir tokens
      await dappToken.connect(addr1).transfer(owner.address, 50);
      expect(await dappToken.balanceOf(owner.address)).to.equal(50);
      expect(await dappToken.balanceOf(addr1.address)).to.equal(50);
    });
  });

  describe("LPToken", function () {
    it("Debería inicializarse con el propietario correcto", async function () {
      expect(await lpToken.owner()).to.equal(owner.address);
    });

    it("Debería permitir acuñar tokens", async function () {
      await lpToken.mint(addr1.address, 200);
      expect(await lpToken.balanceOf(addr1.address)).to.equal(200);
    });
  });
});
