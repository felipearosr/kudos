const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TipJar", function () {
  let tipJar;
  let owner;
  let relayer;
  let creator;
  let fan;
  let otherAccount;
  let domain;
  let types;

  const TIP_AMOUNT = ethers.parseEther("0.1");
  const LARGER_TIP_AMOUNT = ethers.parseEther("0.5");

  beforeEach(async function () {
    // Get signers
    [owner, relayer, creator, fan, otherAccount] = await ethers.getSigners();

    // Deploy TipJar contract
    const TipJar = await ethers.getContractFactory("TipJar");
    tipJar = await TipJar.deploy(relayer.address);
    await tipJar.waitForDeployment();

    // Set up EIP-712 domain and types for signing
    const contractAddress = await tipJar.getAddress();
    domain = {
      name: "MantleTipJar",
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: contractAddress,
    };

    types = {
      Tip: [
        { name: "fan", type: "address" },
        { name: "creator", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    };
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await tipJar.owner()).to.equal(owner.address);
    });

    it("Should set the correct relayer address", async function () {
      expect(await tipJar.relayerAddress()).to.equal(relayer.address);
    });

    it("Should revert if relayer address is zero", async function () {
      const TipJar = await ethers.getContractFactory("TipJar");
      await expect(TipJar.deploy(ethers.ZeroAddress)).to.be.revertedWith(
        "Invalid relayer address"
      );
    });
  });

  describe("Tip Function", function () {
    it("Should process a valid tip successfully", async function () {
      const nonce = await tipJar.getNonce(fan.address);
      const message = {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };

      // Sign the message
      const signature = await fan.signTypedData(domain, types, message);

      // Process the tip
      await expect(
        tipJar
          .connect(relayer)
          .tip(fan.address, creator.address, TIP_AMOUNT, nonce, signature, {
            value: TIP_AMOUNT,
          })
      )
        .to.emit(tipJar, "TipReceived")
        .withArgs(fan.address, creator.address, TIP_AMOUNT, nonce);

      // Check creator's claimable balance
      expect(await tipJar.getClaimableBalance(creator.address)).to.equal(
        TIP_AMOUNT
      );

      // Check that nonce was incremented
      expect(await tipJar.getNonce(fan.address)).to.equal(nonce + 1n);
    });

    it("Should revert if called by non-relayer", async function () {
      const nonce = await tipJar.getNonce(fan.address);
      const message = {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };

      const signature = await fan.signTypedData(domain, types, message);

      await expect(
        tipJar
          .connect(otherAccount)
          .tip(fan.address, creator.address, TIP_AMOUNT, nonce, signature, {
            value: TIP_AMOUNT,
          })
      ).to.be.revertedWith("Unauthorized: Only relayer can call this function");
    });

    it("Should revert with invalid fan address", async function () {
      const nonce = await tipJar.getNonce(fan.address);
      const signature = await fan.signTypedData(domain, types, {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      });

      await expect(
        tipJar
          .connect(relayer)
          .tip(ethers.ZeroAddress, creator.address, TIP_AMOUNT, nonce, signature, {
            value: TIP_AMOUNT,
          })
      ).to.be.revertedWith("Invalid fan address");
    });

    it("Should revert with invalid creator address", async function () {
      const nonce = await tipJar.getNonce(fan.address);
      const signature = await fan.signTypedData(domain, types, {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      });

      await expect(
        tipJar
          .connect(relayer)
          .tip(fan.address, ethers.ZeroAddress, TIP_AMOUNT, nonce, signature, {
            value: TIP_AMOUNT,
          })
      ).to.be.revertedWith("Invalid creator address");
    });

    it("Should revert with zero tip amount", async function () {
      const nonce = await tipJar.getNonce(fan.address);
      const signature = await fan.signTypedData(domain, types, {
        fan: fan.address,
        creator: creator.address,
        amount: 0,
        nonce: nonce,
      });

      await expect(
        tipJar
          .connect(relayer)
          .tip(fan.address, creator.address, 0, nonce, signature, {
            value: 0,
          })
      ).to.be.revertedWith("Tip amount must be greater than zero");
    });

    it("Should revert when sent value doesn't match tip amount", async function () {
      const nonce = await tipJar.getNonce(fan.address);
      const message = {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };

      const signature = await fan.signTypedData(domain, types, message);

      await expect(
        tipJar
          .connect(relayer)
          .tip(fan.address, creator.address, TIP_AMOUNT, nonce, signature, {
            value: LARGER_TIP_AMOUNT,
          })
      ).to.be.revertedWith("Sent value must match tip amount");
    });

    it("Should revert with invalid nonce", async function () {
      const currentNonce = await tipJar.getNonce(fan.address);
      const invalidNonce = currentNonce + 1n;
      
      const message = {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: invalidNonce,
      };

      const signature = await fan.signTypedData(domain, types, message);

      await expect(
        tipJar
          .connect(relayer)
          .tip(fan.address, creator.address, TIP_AMOUNT, invalidNonce, signature, {
            value: TIP_AMOUNT,
          })
      ).to.be.revertedWith("Invalid nonce");
    });

    it("Should revert with invalid signature", async function () {
      const nonce = await tipJar.getNonce(fan.address);
      const message = {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };

      // Sign with wrong signer
      const signature = await otherAccount.signTypedData(domain, types, message);

      await expect(
        tipJar
          .connect(relayer)
          .tip(fan.address, creator.address, TIP_AMOUNT, nonce, signature, {
            value: TIP_AMOUNT,
          })
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should prevent signature replay attacks", async function () {
      const nonce = await tipJar.getNonce(fan.address);
      const message = {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };

      const signature = await fan.signTypedData(domain, types, message);

      // First tip should succeed
      await tipJar
        .connect(relayer)
        .tip(fan.address, creator.address, TIP_AMOUNT, nonce, signature, {
          value: TIP_AMOUNT,
        });

      // Second tip with same signature should fail
      await expect(
        tipJar
          .connect(relayer)
          .tip(fan.address, creator.address, TIP_AMOUNT, nonce, signature, {
            value: TIP_AMOUNT,
          })
      ).to.be.revertedWith("Invalid nonce");
    });

    it("Should accumulate multiple tips for the same creator", async function () {
      // First tip
      let nonce = await tipJar.getNonce(fan.address);
      let message = {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };
      let signature = await fan.signTypedData(domain, types, message);

      await tipJar
        .connect(relayer)
        .tip(fan.address, creator.address, TIP_AMOUNT, nonce, signature, {
          value: TIP_AMOUNT,
        });

      // Second tip
      nonce = await tipJar.getNonce(fan.address);
      message = {
        fan: fan.address,
        creator: creator.address,
        amount: LARGER_TIP_AMOUNT,
        nonce: nonce,
      };
      signature = await fan.signTypedData(domain, types, message);

      await tipJar
        .connect(relayer)
        .tip(fan.address, creator.address, LARGER_TIP_AMOUNT, nonce, signature, {
          value: LARGER_TIP_AMOUNT,
        });

      // Check accumulated balance
      const expectedBalance = TIP_AMOUNT + LARGER_TIP_AMOUNT;
      expect(await tipJar.getClaimableBalance(creator.address)).to.equal(
        expectedBalance
      );
    });
  });

  describe("Withdraw Function", function () {
    beforeEach(async function () {
      // Set up a tip first
      const nonce = await tipJar.getNonce(fan.address);
      const message = {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };

      const signature = await fan.signTypedData(domain, types, message);

      await tipJar
        .connect(relayer)
        .tip(fan.address, creator.address, TIP_AMOUNT, nonce, signature, {
          value: TIP_AMOUNT,
        });
    });

    it("Should allow creator to withdraw their balance", async function () {
      const initialBalance = await ethers.provider.getBalance(creator.address);
      
      const tx = await tipJar.connect(creator).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(creator.address);
      
      // Check that balance increased by tip amount minus gas costs
      expect(finalBalance).to.equal(initialBalance + TIP_AMOUNT - gasUsed);
      
      // Check that claimable balance is now zero
      expect(await tipJar.getClaimableBalance(creator.address)).to.equal(0);
    });

    it("Should emit FundsWithdrawn event", async function () {
      await expect(tipJar.connect(creator).withdraw())
        .to.emit(tipJar, "FundsWithdrawn")
        .withArgs(creator.address, TIP_AMOUNT);
    });

    it("Should revert when trying to withdraw with zero balance", async function () {
      await expect(tipJar.connect(otherAccount).withdraw()).to.be.revertedWith(
        "No funds to withdraw"
      );
    });

    it("Should revert when trying to withdraw twice", async function () {
      await tipJar.connect(creator).withdraw();
      
      await expect(tipJar.connect(creator).withdraw()).to.be.revertedWith(
        "No funds to withdraw"
      );
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to update relayer address", async function () {
      const newRelayer = otherAccount.address;
      
      await expect(tipJar.connect(owner).updateRelayer(newRelayer))
        .to.emit(tipJar, "RelayerUpdated")
        .withArgs(relayer.address, newRelayer);
      
      expect(await tipJar.relayerAddress()).to.equal(newRelayer);
    });

    it("Should revert when non-owner tries to update relayer", async function () {
      await expect(
        tipJar.connect(otherAccount).updateRelayer(otherAccount.address)
      ).to.be.revertedWithCustomError(tipJar, "OwnableUnauthorizedAccount");
    });

    it("Should revert when updating relayer to zero address", async function () {
      await expect(
        tipJar.connect(owner).updateRelayer(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid relayer address");
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      // Add some funds to the contract
      const nonce = await tipJar.getNonce(fan.address);
      const message = {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };

      const signature = await fan.signTypedData(domain, types, message);

      await tipJar
        .connect(relayer)
        .tip(fan.address, creator.address, TIP_AMOUNT, nonce, signature, {
          value: TIP_AMOUNT,
        });
    });

    it("Should allow owner to emergency withdraw", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ethers.provider.getBalance(await tipJar.getAddress());
      
      const tx = await tipJar.connect(owner).emergencyWithdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalBalance).to.equal(initialBalance + contractBalance - gasUsed);
    });

    it("Should revert when non-owner tries emergency withdraw", async function () {
      await expect(
        tipJar.connect(otherAccount).emergencyWithdraw()
      ).to.be.revertedWithCustomError(tipJar, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should return correct nonce for fan", async function () {
      expect(await tipJar.getNonce(fan.address)).to.equal(0);
      
      // Process a tip to increment nonce
      const nonce = await tipJar.getNonce(fan.address);
      const message = {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };

      const signature = await fan.signTypedData(domain, types, message);

      await tipJar
        .connect(relayer)
        .tip(fan.address, creator.address, TIP_AMOUNT, nonce, signature, {
          value: TIP_AMOUNT,
        });

      expect(await tipJar.getNonce(fan.address)).to.equal(1);
    });

    it("Should return correct domain separator", async function () {
      const domainSeparator = await tipJar.getDomainSeparator();
      expect(domainSeparator).to.be.a("string");
      expect(domainSeparator.length).to.equal(66); // 0x + 64 hex chars
    });

    it("Should correctly track signature processing", async function () {
      const nonce = await tipJar.getNonce(fan.address);
      const message = {
        fan: fan.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };

      const signature = await fan.signTypedData(domain, types, message);
      
      // Create digest manually to test isSignatureProcessed
      const structHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "address", "address", "uint256", "uint256"],
          [
            ethers.keccak256(ethers.toUtf8Bytes("Tip(address fan,address creator,uint256 amount,uint256 nonce)")),
            fan.address,
            creator.address,
            TIP_AMOUNT,
            nonce
          ]
        )
      );

      const domainSeparator = await tipJar.getDomainSeparator();
      const digest = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes("\x19\x01"),
          domainSeparator,
          structHash
        ])
      );

      // Should not be processed initially
      expect(await tipJar.isSignatureProcessed(digest, signature)).to.be.false;

      // Process the tip
      await tipJar
        .connect(relayer)
        .tip(fan.address, creator.address, TIP_AMOUNT, nonce, signature, {
          value: TIP_AMOUNT,
        });

      // Should be processed after tip
      expect(await tipJar.isSignatureProcessed(digest, signature)).to.be.true;
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should handle multiple fans tipping the same creator", async function () {
      const [fan1, fan2] = [fan, otherAccount];
      
      // Fan1 tips
      let nonce = await tipJar.getNonce(fan1.address);
      let message = {
        fan: fan1.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };
      let signature = await fan1.signTypedData(domain, types, message);

      await tipJar
        .connect(relayer)
        .tip(fan1.address, creator.address, TIP_AMOUNT, nonce, signature, {
          value: TIP_AMOUNT,
        });

      // Fan2 tips
      nonce = await tipJar.getNonce(fan2.address);
      message = {
        fan: fan2.address,
        creator: creator.address,
        amount: LARGER_TIP_AMOUNT,
        nonce: nonce,
      };
      signature = await fan2.signTypedData(domain, types, message);

      await tipJar
        .connect(relayer)
        .tip(fan2.address, creator.address, LARGER_TIP_AMOUNT, nonce, signature, {
          value: LARGER_TIP_AMOUNT,
        });

      // Check total balance
      const expectedBalance = TIP_AMOUNT + LARGER_TIP_AMOUNT;
      expect(await tipJar.getClaimableBalance(creator.address)).to.equal(
        expectedBalance
      );
    });

    it("Should handle large tip amounts", async function () {
      const largeTip = ethers.parseEther("10");
      const nonce = await tipJar.getNonce(fan.address);
      const message = {
        fan: fan.address,
        creator: creator.address,
        amount: largeTip,
        nonce: nonce,
      };

      const signature = await fan.signTypedData(domain, types, message);

      await tipJar
        .connect(relayer)
        .tip(fan.address, creator.address, largeTip, nonce, signature, {
          value: largeTip,
        });

      expect(await tipJar.getClaimableBalance(creator.address)).to.equal(largeTip);
    });

    it("Should maintain separate nonces for different fans", async function () {
      const [fan1, fan2] = [fan, otherAccount];
      
      expect(await tipJar.getNonce(fan1.address)).to.equal(0);
      expect(await tipJar.getNonce(fan2.address)).to.equal(0);

      // Fan1 tips
      let nonce = await tipJar.getNonce(fan1.address);
      let message = {
        fan: fan1.address,
        creator: creator.address,
        amount: TIP_AMOUNT,
        nonce: nonce,
      };
      let signature = await fan1.signTypedData(domain, types, message);

      await tipJar
        .connect(relayer)
        .tip(fan1.address, creator.address, TIP_AMOUNT, nonce, signature, {
          value: TIP_AMOUNT,
        });

      expect(await tipJar.getNonce(fan1.address)).to.equal(1);
      expect(await tipJar.getNonce(fan2.address)).to.equal(0);
    });
  });
});