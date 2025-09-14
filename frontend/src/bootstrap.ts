(async () => {
  await window.__APP_METADATA_READY__;
  const appName = import.meta.env.VITE_APP;
  console.log('appName', appName);
  console.log('window.__APP_METADATA__', window.__APP_METADATA__);
  await import(`./index.${appName}.tsx`);
})();
