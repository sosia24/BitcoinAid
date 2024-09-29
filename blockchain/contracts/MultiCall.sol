// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./IQueueDistribution.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./IBTCACollection.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract MultiCall is Ownable, ERC1155Holder {
    using SafeERC20 for IERC20;

    IQueueDistribution public queueDistribution;
    IBTCACollection public BTCACollection;

    uint256[] public tokenIds;
    IERC20 token;
    IERC20 usdt;

    constructor(
        address initialOwner,
        address collection,
        address queue,
        address _token,
        address _usdt
    ) Ownable(initialOwner) {
        BTCACollection = IBTCACollection(collection);
        queueDistribution = IQueueDistribution(queue);
        token = IERC20(_token);
        usdt = IERC20(_usdt);
    }

    function setQueueDistribution(address _queue) external onlyOwner {
        queueDistribution = IQueueDistribution(_queue);
    }

    function swap(uint amountIn) external onlyOwner returns (uint amountOut) {
        //0xc2132D05D31c914a87C6611C10748AEb04B58e8F USDT
        //0xbeEC09c5aE9BB732083488551BD509311507Ae7C BUBBLE
        IERC20(0xc2132D05D31c914a87C6611C10748AEb04B58e8F).approve(
            address(0xE592427A0AEce92De3Edee1F18E0157C05861564),
            amountIn
        );

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F,
                tokenOut: 0xbeEC09c5aE9BB732083488551BD509311507Ae7C,
                fee: 100,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        amountOut = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564)
            .exactInputSingle(params);
    }

    function depositNFT(uint256 tokenId) external onlyOwner {
        BTCACollection.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            1,
            ""
        );

        tokenIds.push(tokenId);
    }

    function withdrawNFT() external onlyOwner {
        require(tokenIds.length > 0, "No NFTs to withdraw");

        uint256 tokenId = tokenIds[0];

        removeTokenIdAtIndex(0);

        BTCACollection.safeTransferFrom(
            address(this),
            msg.sender,
            tokenId,
            1,
            ""
        );
    }

    function claimToken(bool _usdt) external onlyOwner {
        if (_usdt) {
            usdt.safeTransfer(msg.sender, usdt.balanceOf(address(this)));
        } else {
            token.safeTransfer(msg.sender, token.balanceOf(address(this)));
        }
    }

    function removeTokenIdAtIndex(uint256 index) internal {
        require(index < tokenIds.length, "Index out of bounds");

        tokenIds[index] = tokenIds[tokenIds.length - 1];

        tokenIds.pop();
    }

    function multiCall() external onlyOwner {
        require(tokenIds.length > 0, "No nfts on the contract");

        uint queueId = BTCACollection.getCurrentBatch();
        uint lastUnpaidQueue = queueDistribution.getLastUnpaidQueue();

        if (queueId == lastUnpaidQueue) {
            uint size = queueDistribution.getQueueSizeByBatch(lastUnpaidQueue);
            if (size >= 2) {
                uint256 tokenId1 = tokenIds[0];
                uint256 tokenId2 = tokenIds[1];
                removeTokenIdAtIndex(0);
                removeTokenIdAtIndex(0);
                queueDistribution.addToQueue(tokenId1);
                queueDistribution.addToQueue(tokenId2);
            } else if (size == 1) {
                uint256 tokenId1 = tokenIds[0];
                uint256 tokenId2 = tokenIds[1];
                uint256 tokenId3 = tokenIds[2];

                removeTokenIdAtIndex(0);
                removeTokenIdAtIndex(0);
                removeTokenIdAtIndex(0);

                queueDistribution.addToQueue(tokenId1);
                queueDistribution.addToQueue(tokenId2);
                queueDistribution.addToQueue(tokenId3);
            } else if (size == 0) {
                uint256 tokenId1 = tokenIds[0];
                uint256 tokenId2 = tokenIds[1];
                uint256 tokenId3 = tokenIds[2];
                uint256 tokenId4 = tokenIds[3];

                removeTokenIdAtIndex(0);
                removeTokenIdAtIndex(0);
                removeTokenIdAtIndex(0);
                removeTokenIdAtIndex(0);

                queueDistribution.addToQueue(tokenId1);
                queueDistribution.addToQueue(tokenId2);
                queueDistribution.addToQueue(tokenId3);
                queueDistribution.addToQueue(tokenId4);
            }

            uint position = queueDistribution.getCurrentIndex();
            queueDistribution.claim(position - 1, queueId);
        } else if (queueId > lastUnpaidQueue) {
            uint totalSize = queueId - lastUnpaidQueue + 1;

            uint[] memory size = new uint[](totalSize);
            uint allUsers;
            uint index = 0;

            while (queueId >= lastUnpaidQueue) {
                uint value = queueDistribution.getQueueSizeByBatch(
                    lastUnpaidQueue
                );
                size[index] = value;
                ++lastUnpaidQueue;
                ++index;
                allUsers += value;
            }
            require(size[0] < 4, "Last unpaid queue >= 4 queue completed");
            if (size[0] == 1) {
                if (allUsers == size[0]) {
                    uint256 tokenId1 = tokenIds[0];
                    uint256 tokenId2 = tokenIds[1];
                    uint256 tokenId3 = tokenIds[2];

                    removeTokenIdAtIndex(0);
                    removeTokenIdAtIndex(0);
                    removeTokenIdAtIndex(0);

                    queueDistribution.addToQueue(tokenId1);
                    queueDistribution.addToQueue(tokenId2);
                    queueDistribution.addToQueue(tokenId3);
                } else {
                    if (size.length > 2) {
                        uint batchSum = 0;
                        for (uint i = 1; i < size.length - 1; i++) {
                            batchSum += size[i];
                        }
                        require(batchSum <= 2, "Batch size exceeds limit");
                        if (batchSum == 1) {
                            if (size[size.length - 1] == 0) {
                                uint256 tokenId1 = tokenIds[0];
                                uint256 tokenId2 = tokenIds[1];
                                removeTokenIdAtIndex(0);
                                removeTokenIdAtIndex(0);
                                queueDistribution.addToQueue(tokenId1);
                                queueDistribution.addToQueue(tokenId2);
                            } else {
                                uint256 tokenId1 = tokenIds[0];
                                removeTokenIdAtIndex(0);
                                queueDistribution.addToQueue(tokenId1);
                            }
                        } else if (batchSum == 2) {
                            uint256 tokenId1 = tokenIds[0];

                            removeTokenIdAtIndex(0);

                            queueDistribution.addToQueue(tokenId1);
                        } else if (batchSum == 0) {
                            uint256 tokenId1 = tokenIds[0];
                            uint256 tokenId2 = tokenIds[1];
                            removeTokenIdAtIndex(0);
                            removeTokenIdAtIndex(0);
                            queueDistribution.addToQueue(tokenId1);
                            queueDistribution.addToQueue(tokenId2);
                        } else {
                            require(false, "Algum erro");
                        }
                    } else {
                        uint256 tokenId1 = tokenIds[0];
                        uint256 tokenId2 = tokenIds[1];
                        removeTokenIdAtIndex(0);
                        removeTokenIdAtIndex(0);

                        queueDistribution.addToQueue(tokenId1);
                        queueDistribution.addToQueue(tokenId2);
                    }
                }
                uint position = queueDistribution.getCurrentIndex();

                queueDistribution.claim(position - 1, queueId);
            } else if (size[0] == 2) {
                if (allUsers == size[0]) {
                    uint256 tokenId1 = tokenIds[0];
                    uint256 tokenId2 = tokenIds[1];
                    removeTokenIdAtIndex(0);
                    removeTokenIdAtIndex(0);
                    queueDistribution.addToQueue(tokenId1);
                    queueDistribution.addToQueue(tokenId2);
                } else {
                    if (size.length > 2) {
                        uint batchSum = 0;
                        for (uint i = 1; i < size.length - 1; i++) {
                            batchSum += size[i];
                        }
                        require(batchSum <= 1, "Batch size exceeds limit");
                        uint256 tokenId1 = tokenIds[0];
                        removeTokenIdAtIndex(0);
                        queueDistribution.addToQueue(tokenId1);
                    } else {
                        uint256 tokenId1 = tokenIds[0];

                        removeTokenIdAtIndex(0);

                        queueDistribution.addToQueue(tokenId1);
                    }
                }
                uint position = queueDistribution.getCurrentIndex();

                queueDistribution.claim(position - 1, queueId);
            } else if (size[0] == 3) {
                if (allUsers == size[0]) {
                    uint256 tokenId1 = tokenIds[0];
                    removeTokenIdAtIndex(0);
                    queueDistribution.addToQueue(tokenId1);
                } else {
                    if (size.length > 2) {
                        uint batchSum = 0;
                        for (uint i = 1; i < size.length - 1; i++) {
                            batchSum += size[i];
                        }
                        require(batchSum == 0, "Batch size exceeds limit");
                    }
                    uint256 tokenId1 = tokenIds[0];
                    removeTokenIdAtIndex(0);
                    queueDistribution.addToQueue(tokenId1);
                }
                uint position = queueDistribution.getCurrentIndex();

                queueDistribution.claim(position - 1, queueId);
            } else {
                require(false, "Impossible 2");
            }
        } else {
            require(false, "Impossible 3");
        }
    }

    function setApprovalForAll() external onlyOwner {
        BTCACollection.setApprovalForAll(address(queueDistribution), true);
        usdt.approve(address(BTCACollection), type(uint256).max);
    }
}
