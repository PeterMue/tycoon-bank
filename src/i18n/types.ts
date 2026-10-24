export interface TranslationSchema {
  app: {
    title: string;
    subtitle: string;
    circulatingSupply: string;
    playersCount: string;
    infiniteBank: string;
  };
  nav: {
    addPlayer: string;
    history: string;
    settings: string;
    share: string;
    fullscreen: string;
    exitFullscreen: string;
    soundOn: string;
    soundOff: string;
    tableMode: string;
    gridMode: string;
  };
  bank: {
    vaultTitle: string;
    infiniteReserve: string;
    dropToDeposit: string;
    dragToPay: string;
    depositToBank: string;
    payoutFromBank: string;
    totalCirculation: string;
  };
  card: {
    passGo: string;
    transfer: string;
    edit: string;
    rotate: string;
    bankrupt: string;
    declareBankruptcy: string;
    revive: string;
    accountBalance: string;
    cardNumber: string;
    dragHint: string;
  };
  transfer: {
    title: string;
    sender: string;
    recipient: string;
    amount: string;
    reason: string;
    optionalNote: string;
    confirmTransfer: string;
    cancel: string;
    insufficientFunds: string;
    samePlayerError: string;
    enterValidAmount: string;
    quickMultipliers: {
      thousand: string;
      million: string;
      billion: string;
    };
    reasons: {
      passGo: string;
      rent: string;
      property: string;
      tax: string;
      jail: string;
      trade: string;
      other: string;
    };
    allIn: string;
    clear: string;
    backspace: string;
  };
  history: {
    title: string;
    noTransactions: string;
    undo: string;
    undone: string;
    undoSuccess: string;
    clearLedger: string;
    confirmClear: string;
    exportCSV: string;
    timeAgo: string;
    from: string;
    to: string;
  };
  settings: {
    title: string;
    language: string;
    gameTitle: string;
    startingBalance: string;
    passGoAmount: string;
    currencySymbol: string;
    thousandSeparator: string;
    soundEffects: string;
    hapticFeedback: string;
    resetGame: string;
    confirmReset: string;
    save: string;
    presetClassic: string;
    presetMillions: string;
  };
  share: {
    title: string;
    description: string;
    copyLink: string;
    linkCopied: string;
    scanQr: string;
    exportJson: string;
    importJson: string;
    importSuccess: string;
    importError: string;
    shareVia: string;
  };
  playerModal: {
    titleAdd: string;
    titleEdit: string;
    nameLabel: string;
    namePlaceholder: string;
    avatarLabel: string;
    themeLabel: string;
    initialBalance: string;
    deletePlayer: string;
    confirmDelete: string;
    save: string;
    cancel: string;
  };
  welcome: {
    title: string;
    description: string;
    addFirstPlayer: string;
    loadDemo: string;
  };
}
