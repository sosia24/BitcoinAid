import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Donation", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("BitcoinAid");
    const token = await Token.deploy();
    const btcaAddress = await token.getAddress();

    const UniswapOracle = await ethers.getContractFactory("UniswapOracle");
    const uniswapOracle = await UniswapOracle.deploy();
    const uniswapOracleAddress = await uniswapOracle.getAddress();

    const USDT = await ethers.getContractFactory("USDT");
    const usdt = await USDT.deploy();
    const tokenAddress = await usdt.getAddress();

    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManager = await PaymentManager.deploy(
      tokenAddress,
      owner.address
    );
    const paymentManagerAddress = await paymentManager.getAddress();
    const ReserveBTCA = await ethers.getContractFactory("ReserveBTCA");
    const reserveBtca = await ReserveBTCA.deploy(
      tokenAddress,
      btcaAddress,
      owner.address
    );
    const resveBtcaAddress = await reserveBtca.getAddress();
    const ReservePools = await ethers.getContractFactory("ReservePools");
    const reservePools = await ReservePools.deploy(tokenAddress, owner.address);
    const reservePoolsAddress = await reservePools.getAddress();

    const BTCACollection = await ethers.getContractFactory("BTCACollection");
    const collection = await BTCACollection.deploy(
      owner.address,
      tokenAddress,
      paymentManagerAddress
    );
    const collectionAddress = await collection.getAddress();
    await collection.setReserveBtca(resveBtcaAddress);
    await collection.setReservePools(reservePoolsAddress);
    await paymentManager.setCollection(collectionAddress);
    await reserveBtca.setCollection(collectionAddress);
    await reservePools.setCollection(collectionAddress);
    const Queue = await ethers.getContractFactory("QueueDistribution");
    const queue = await Queue.deploy(
      collectionAddress,
      btcaAddress,
      owner.address,
      owner.address
    );
    const queueAddress = await queue.getAddress();

    const Donation = await ethers.getContractFactory("DonationBTCA");
    const donation = await Donation.deploy(
      btcaAddress,
      owner.address,
      paymentManagerAddress,
      uniswapOracleAddress,
      queueAddress
    );
    const donationAddress = await donation.getAddress();

    await queue.setDonationContract(donationAddress);
    await paymentManager.setDonation(donationAddress);
    await token.approve(donationAddress, ethers.parseUnits("1000000", "ether"));
    await donation.addDistributionFunds(ethers.parseUnits("1000000", "ether"));
    return {
      owner,
      otherAccount,
      donation,
      token,
      donationAddress,
      paymentManager,
      paymentManagerAddress,
    };
  }

  it("Should create donation", async function () {
    const {
      owner,
      otherAccount,

      donation,
      token,
      donationAddress,
    } = await loadFixture(deployFixture);
    expect(await donation.distributionBalance()).to.be.equal(
      ethers.parseUnits("990000", "ether")
    );
    await donation.donate(ethers.parseUnits("100", "ether"), true);
    expect((await donation.getUser(owner.address)).balance).to.be.equal(
      90 * 10 ** 6
    );
  });
  it("Should create donation", async function () {
    const {
      owner,
      otherAccount,

      donation,
      token,
      donationAddress,
    } = await loadFixture(deployFixture);
    await donation.donate(ethers.parseUnits("100", "ether"), true);
    await time.increase(60 * 60 * 24 * 10);
    await donation.donate(ethers.parseUnits("100", "ether"), true);
    await time.increase(60 * 60 * 24 * 10);
    await expect(donation.claimDonation()).to.be.revertedWith(
      "Tokens are still locked for 15 days"
    );
    const balance = await token.balanceOf(owner.address);

    await time.increase(60 * 60 * 24 * 10);

    await donation.claimDonation();

    expect(await token.balanceOf(owner.address)).to.be.equal(
      balance + ethers.parseUnits("225.72", "ether")
    );
  });
  it("Should not create donation (minor than 10)", async function () {
    const {
      owner,
      otherAccount,

      donation,
      token,
      donationAddress,
    } = await loadFixture(deployFixture);

    await expect(
      donation.donate(ethers.parseUnits("1", "ether"), true)
    ).revertedWith("Amount must be greater than 10 dollars");
  });
  it("Should claim donation funds lvl 3", async function () {
    const {
      owner,
      otherAccount,

      donation,
      token,
      donationAddress,
    } = await loadFixture(deployFixture);
    await donation.donate(ethers.parseUnits("100", "ether"), true);
    expect(await donation.timeUntilNextWithdrawal(owner.address)).to.be.within(
      60 * 60 * 24 * 15 - 5,
      60 * 60 * 24 * 15 + 5
    );
    await time.increase(60 * 60 * 24 * 15);
    expect(await donation.timeUntilNextWithdrawal(owner.address)).to.be.equal(
      0
    );
    const oldBalance = await token.balanceOf(owner.address);

    await donation.claimDonation();
    expect(await donation.distributionBalance()).to.be.equal(
      ethers.parseUnits("990000", "ether") - ethers.parseUnits("120", "ether")
    );
    expect(await token.balanceOf(owner.address)).to.be.equal(
      oldBalance + ethers.parseUnits("112.86", "ether")
    );

    await donation.donate(ethers.parseUnits("100", "ether"), false);
    expect(await donation.timeUntilNextWithdrawal(owner.address)).to.be.within(
      60 * 60 * 24 * 30 - 5,
      60 * 60 * 24 * 30 + 5
    );
    await time.increase(60 * 60 * 24 * 30);
    expect(await donation.timeUntilNextWithdrawal(owner.address)).to.be.equal(
      0
    );
    const oldBalance2 = await token.balanceOf(owner.address);
    const distributionBalance = await donation.distributionBalance();

    await donation.claimDonation();
    expect(await donation.distributionBalance()).to.be.equal(
      distributionBalance - ethers.parseUnits("170", "ether")
    );
    expect(await token.balanceOf(owner.address)).to.be.equal(
      oldBalance2 + ethers.parseUnits("159.885", "ether")
    );
    console.log(await donation.nextPoolFilling());
  });
  it("Should claim donation funds lvl 2", async function () {
    const {
      owner,
      otherAccount,

      donation,
      token,
      donationAddress,
    } = await loadFixture(deployFixture);
    await token.approve(
      donationAddress,
      ethers.parseUnits("600000000", "ether")
    );
    await donation.addDistributionFunds(
      ethers.parseUnits("600000000", "ether")
    );
    await donation.donate(ethers.parseUnits("100", "ether"), true);

    await time.increase(60 * 60 * 24 * 15);

    const oldBalance = await token.balanceOf(owner.address);
    const distributionBalance = await donation.distributionBalance();

    await donation.claimDonation();

    expect(await donation.distributionBalance()).to.be.equal(
      distributionBalance - ethers.parseUnits("130", "ether")
    );
    expect(await token.balanceOf(owner.address)).to.be.equal(
      oldBalance + ethers.parseUnits("122.265", "ether")
    );

    await donation.donate(ethers.parseUnits("100", "ether"), false);

    await time.increase(60 * 60 * 24 * 30);

    const oldBalance2 = await token.balanceOf(owner.address);
    const distributionBalance2 = await donation.distributionBalance();
    await donation.claimDonation();
    expect(await donation.distributionBalance()).to.be.equal(
      distributionBalance2 - ethers.parseUnits("190", "ether")
    );
    expect(await token.balanceOf(owner.address)).to.be.equal(
      oldBalance2 + ethers.parseUnits("178.695", "ether")
    );
  });
  it("Should claim donation funds lvl 1", async function () {
    const {
      owner,
      otherAccount,

      donation,
      token,
      donationAddress,
      paymentManager,
      paymentManagerAddress,
    } = await loadFixture(deployFixture);
    await token.approve(
      donationAddress,
      ethers.parseUnits("1100000000", "ether")
    );
    await donation.addDistributionFunds(
      ethers.parseUnits("1100000000", "ether")
    );
    await donation.donate(ethers.parseUnits("100", "ether"), true);

    await time.increase(60 * 60 * 24 * 15);

    const oldBalance = await token.balanceOf(owner.address);
    const distributionBalance = await donation.distributionBalance();

    await donation.claimDonation();

    expect(await token.balanceOf(paymentManagerAddress)).to.be.equal(
      ethers.parseUnits("6.93", "ether")
    );
    expect(await paymentManager.balanceFree()).to.be.equal(
      ethers.parseUnits("6.93", "ether")
    );
    expect(await donation.distributionBalance()).to.be.equal(
      distributionBalance - ethers.parseUnits("140", "ether")
    );
    expect(await token.balanceOf(owner.address)).to.be.equal(
      oldBalance + ethers.parseUnits("131.67", "ether")
    );

    await donation.donate(ethers.parseUnits("100", "ether"), false);

    await time.increase(60 * 60 * 24 * 30);

    const oldBalance2 = await token.balanceOf(owner.address);
    const distributionBalance2 = await donation.distributionBalance();
    await donation.claimDonation();
    expect(await donation.distributionBalance()).to.be.equal(
      distributionBalance2 - ethers.parseUnits("210", "ether")
    );
    expect(await token.balanceOf(owner.address)).to.be.equal(
      oldBalance2 + ethers.parseUnits("197.505", "ether")
    );
  });
  it("Should claim donation funds lvl 0", async function () {
    const {
      owner,
      otherAccount,

      donation,
      token,
      donationAddress,
    } = await loadFixture(deployFixture);
    await token.approve(
      donationAddress,
      ethers.parseUnits("1600000000", "ether")
    );
    await donation.addDistributionFunds(
      ethers.parseUnits("1600000000", "ether")
    );
    await donation.donate(ethers.parseUnits("100", "ether"), true);

    await time.increase(60 * 60 * 24 * 15);

    const oldBalance = await token.balanceOf(owner.address);
    const distributionBalance = await donation.distributionBalance();

    await donation.claimDonation();

    expect(await donation.distributionBalance()).to.be.equal(
      distributionBalance - ethers.parseUnits("150", "ether")
    );
    expect(await token.balanceOf(owner.address)).to.be.equal(
      oldBalance + ethers.parseUnits("141.075", "ether")
    );

    await donation.donate(ethers.parseUnits("100", "ether"), false);

    await time.increase(60 * 60 * 24 * 30);

    const oldBalance2 = await token.balanceOf(owner.address);
    const distributionBalance2 = await donation.distributionBalance();
    await donation.claimDonation();
    expect(await donation.distributionBalance()).to.be.equal(
      distributionBalance2 - ethers.parseUnits("230", "ether")
    );
    expect(await token.balanceOf(owner.address)).to.be.equal(
      oldBalance2 + ethers.parseUnits("216.315", "ether")
    );
  });
  it("Should not claim donation tokens locked (15)", async function () {
    const {
      owner,
      otherAccount,

      donation,
      token,
      donationAddress,
    } = await loadFixture(deployFixture);
    await donation.donate(ethers.parseUnits("100", "ether"), true);

    await expect(donation.claimDonation()).to.be.revertedWith(
      "Tokens are still locked for 15 days"
    );
  });
  it("Should not claim donation tokens locked (30)", async function () {
    const {
      owner,
      otherAccount,

      donation,
      token,
      donationAddress,
    } = await loadFixture(deployFixture);
    await donation.donate(ethers.parseUnits("100", "ether"), false);

    await expect(donation.claimDonation()).to.be.revertedWith(
      "Tokens are still locked for 30 days"
    );
  });
  it("Should not claim donation (insufficient distribution balance)", async function () {
    const {
      owner,
      otherAccount,

      donation,
      token,
      donationAddress,
    } = await loadFixture(deployFixture);
    await token.approve(donationAddress, ethers.parseUnits("1000000", "ether"));
    await donation.donate(ethers.parseUnits("1000000", "ether"), false);
    await time.increase(60 * 60 * 24 * 30);
    await expect(donation.claimDonation()).to.be.revertedWith(
      "Insufficient token balance for distribution"
    );
  });
});
