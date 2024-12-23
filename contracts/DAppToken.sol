// SPDX-License-Identifier: MIT
// author: JuanIFerrando
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DAppToken
 * @dev Token ERC-20 utilizado para recompensas en la plataforma.
 */
contract DAppToken is ERC20, Ownable {
    /**
     * @notice Constructor que inicializa el contrato con un nombre y símbolo.
     * @param initialOwner Dirección que será asignada como propietaria del contrato.
     */
    constructor(
        address initialOwner
    ) ERC20("DApp Token", "DAPP") Ownable(initialOwner) {}

    /**
     * @notice Función para acuñar (mint) nuevos tokens de recompensa.
     * @param to Dirección a la que se enviarán los tokens acuñados.
     * @param amount Cantidad de tokens a acuñar.
     * @dev Solo el propietario del contrato puede ejecutar esta función.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
