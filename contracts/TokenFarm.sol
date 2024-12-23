// SPDX-License-Identifier: MIT
// author: JuanIFerrando
pragma solidity ^0.8.18;

import "./DAppToken.sol";
import "./LPToken.sol";

/**
 * @title TokenFarm
 * @notice Plataforma de staking que permite a los usuarios depositar tokens LP y recibir recompensas en DAPP tokens.
 */
contract TokenFarm {
    // Variables de estado
    string public name = "Proportional Token Farm";
    address public owner; // Dirección del propietario del contrato
    DAppToken public dappToken; // Contrato del token de recompensas
    LPToken public lpToken; // Contrato del token LP

    uint256 public constant REWARD_PER_BLOCK = 1e18; // Recompensa total distribuida por bloque
    uint256 public totalStakingBalance; // Cantidad total de tokens LP en staking
    uint256 public feePercentage = 5; // Porcentaje de comisión sobre las recompensas (5%)

    address[] public stakers; // Lista de usuarios que han hecho staking
    mapping(address => StakingInfo) public stakingInfo; // Información de staking por usuario

    // Eventos
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDistributed(address indexed user, uint256 amount);
    event FeeWithdrawn(address indexed owner, uint256 amount);

    // Struct que almacena la información del staking de un usuario
    struct StakingInfo {
        uint256 stakingBalance; // Balance actual de staking
        uint256 checkpoint; // Último bloque donde se calcularon las recompensas
        uint256 pendingRewards; // Recompensas acumuladas pendientes de reclamar
        bool hasStaked; // Indica si el usuario ha hecho staking al menos una vez
        bool isStaking; // Indica si el usuario tiene tokens LP en staking
    }

    // Constructor
    constructor(DAppToken _dappToken, LPToken _lpToken) {
        dappToken = _dappToken;
        lpToken = _lpToken;
        owner = msg.sender;
    }

    /**
     * @notice Deposita tokens LP para staking.
     * @param _amount Cantidad de tokens LP a depositar.
     */
    function deposit(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");

        // Transferir tokens LP al contrato
        lpToken.transferFrom(msg.sender, address(this), _amount);

        StakingInfo storage user = stakingInfo[msg.sender];

        // Si es la primera vez que el usuario hace staking, agregarlo a la lista
        if (!user.hasStaked) {
            stakers.push(msg.sender);
            user.hasStaked = true;
        }

        // Actualizar balances y marcar al usuario como activo
        distributeRewards(msg.sender);
        user.stakingBalance += _amount;
        totalStakingBalance += _amount;
        user.isStaking = true;
        user.checkpoint = block.number;

        emit Deposit(msg.sender, _amount);
    }

    /**
     * @notice Retira todos los tokens LP en staking.
     */
    function withdraw() external {
        StakingInfo storage user = stakingInfo[msg.sender];
        require(user.isStaking, "No active staking");
        require(user.stakingBalance > 0, "Staking balance is zero");

        // Calcular recompensas antes del retiro
        distributeRewards(msg.sender);

        uint256 amountToWithdraw = user.stakingBalance;
        user.stakingBalance = 0;
        totalStakingBalance -= amountToWithdraw;
        user.isStaking = false;

        // Transferir tokens LP de vuelta al usuario
        lpToken.transfer(msg.sender, amountToWithdraw);
        emit Withdraw(msg.sender, amountToWithdraw);
    }

    /**
     * @notice Reclama recompensas acumuladas.
     */
    function claimRewards() external {
        StakingInfo storage user = stakingInfo[msg.sender];
        uint256 rewards = user.pendingRewards;
        require(rewards > 0, "No rewards to claim");

        // Aplicar comisión y transferir recompensas
        uint256 fee = (rewards * feePercentage) / 100;
        uint256 netRewards = rewards - fee;

        user.pendingRewards = 0;

        // Transfiere las recompensas al usuario y comision al propietario
        dappToken.mint(msg.sender, netRewards);
        dappToken.mint(owner, fee);

        emit RewardsClaimed(msg.sender, netRewards);
        emit FeeWithdrawn(owner, fee);
    }

    /**
     * @notice Calcula y actualiza recompensas para todos los usuarios.
     */
    function distributeRewardsAll() external onlyOwner {
        for (uint256 i = 0; i < stakers.length; i++) {
            address userAddress = stakers[i];
            distributeRewards(userAddress);
        }
    }

    /**
     * @notice Calcula recompensas proporcionales para un usuario.
     * @param user Dirección del usuario.
     * @dev La función distribuye recompensas basadas en la participación del usuario en el staking total.
     */
    function distributeRewards(address user) private {
        StakingInfo storage stakingUser = stakingInfo[user];
        uint256 blocksPassed = block.number - stakingUser.checkpoint;

        // Verificar si hay bloques transcurridos y staking activo
        if (blocksPassed > 0 && totalStakingBalance > 0) {
            // Calcular participación proporcional y recompensas acumuladas
            uint256 userShare = (stakingUser.stakingBalance * 1e18) /
                totalStakingBalance;
            uint256 rewards = (REWARD_PER_BLOCK * blocksPassed * userShare) /
                1e18;

            // Actualizar recompensas pendientes y el checkpoint
            stakingUser.pendingRewards += rewards;
            stakingUser.checkpoint = block.number;

            emit RewardsDistributed(user, rewards);
        }
    }

    // Modifier para funciones exclusivas del propietario
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }
}
