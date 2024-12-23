# Basic DeFi Yield Farming

## Descripción

**Basic DeFi Yield Farming** es una aplicación descentralizada que permite a los usuarios realizar staking de tokens LP para ganar recompensas en forma de DAPP tokens. Es un proyecto educativo diseñado para aprender sobre contratos inteligentes, sistemas de staking y distribución proporcional de recompensas en Ethereum.

## Funcionalidades Principales

- **Staking de LP Tokens:** Los usuarios pueden depositar tokens LP para participar en el sistema de recompensas.
- **Recompensas Proporcionales:** Las recompensas se distribuyen según el tiempo de staking y la cantidad depositada.
- **Reclamo de Recompensas:** Los usuarios pueden reclamar sus recompensas acumuladas.
- **Retiro Completo:** Los usuarios pueden retirar tanto sus tokens stakeados como las recompensas pendientes.
- **Tarifa de Reclamo:** Se cobra una tarifa sobre las recompensas, destinada al propietario del contrato.

## Contratos

### DAppToken

Un contrato ERC20 que representa el token de recompensas (DAPP). Este contrato permite acuñar tokens para recompensas y transferir su propiedad al contrato principal (`TokenFarm`).

### LPToken

Un contrato ERC20 que simula los tokens de proveedor de liquidez (LP Tokens) que los usuarios pueden stakear en la plataforma.

### TokenFarm

El contrato principal que gestiona:

- El staking de LP tokens.
- La distribución de recompensas.
- Las tarifas sobre las recompensas.

## Requisitos Previos

- [Node.js](https://nodejs.org/) y npm instalados.
- [Hardhat](https://hardhat.org/) para desarrollo y pruebas de contratos inteligentes.
- Una red de pruebas local configurada con Hardhat.

## Estructura del Proyecto

````plaintext
├── contracts
│   ├── DAppToken.sol       # Token ERC20 para recompensas.
│   ├── LPToken.sol         # Token ERC20 para staking.
│   ├── TokenFarm.sol       # Contrato principal.
│
├── scripts
│   ├── deploy.ts           # Script para desplegar contratos.
│
├── test
│   ├── TokenFarm.test.ts   # Pruebas unitarias del contrato principal.
│
├── hardhat.config.ts       # Configuración de Hardhat.
├── package.json            # Dependencias del proyecto.
├── README.md               # Documentación.

## Instalación

Clona el repositorio y ejecuta el siguiente comando para instalar las dependencias necesarias:

```bash
npm install
````

## Scripts Disponibles

### Compilar los Contratos

```bash
npx hardhat compile
```

### Ejecutar Tests

```bash
npx hardhat test
```

### Desplegar Contratos (red local)

```bash
npx hardhat run scripts/deploy.ts
```

## Descripción de Tests

Los tests se encuentran en la carpeta `test/` e incluyen los siguientes escenarios:

1. **Minting y Depósito:** Verifica que los usuarios puedan acuñar LP tokens y depositarlos en el contrato `TokenFarm`.
2. **Distribución de Recompensas:** Comprueba que las recompensas se calculen y distribuyan correctamente.
3. **Reclamo de Recompensas:** Asegura que los usuarios puedan reclamar sus recompensas correctamente.
4. **Retiro Completo:** Verifica que los usuarios puedan retirar tanto sus tokens stakeados como las recompensas pendientes.
5. **Cobro de Tarifas:** Confirma que se cobre una tarifa en las recompensas y que esta se transfiera al propietario del contrato.

## Configuración Adicional

### Transferencia de Propiedad

En el script de despliegue, asegúrate de transferir la propiedad de `DAppToken` al contrato `TokenFarm` para permitir la correcta operación del sistema:

```typescript
await dappToken.transferOwnership(await tokenFarm.getAddress());
```

### Simulación de Tiempo

Los tests utilizan los siguientes comandos para manipular el tiempo y simular el paso de bloques:

```typescript
await ethers.provider.send("evm_increaseTime", [100]); // Incrementa el tiempo en 100 segundos
await ethers.provider.send("evm_mine", []); // Mina un nuevo bloque
```

## Dependencias

- [OpenZeppelin](https://openzeppelin.com/contracts/) (para contratos ERC20 estándar).
- [Hardhat](https://hardhat.org/) (entorno de desarrollo y pruebas).
- [Ethers.js](https://docs.ethers.io/) (interacción con contratos inteligentes).

## Licencia

Este proyecto está bajo la Licencia MIT. Puedes consultarla en el archivo `LICENSE`.

---

¡Gracias por usar **Basic DeFi Yield Farming**!
