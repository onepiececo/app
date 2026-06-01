const script = `(function(){try{
  var s=localStorage.getItem('theme');
  var m=window.matchMedia('(prefers-color-scheme: dark)').matches;
  var t=(s==='light'||s==='dark')?s:(m?'dark':'light');
  var d=document.documentElement;
  if(t==='dark')d.classList.add('dark');else d.classList.remove('dark');
  d.style.colorScheme=t;
}catch(e){}})();`;

export const ThemeScript = () => (
  <script dangerouslySetInnerHTML={{ __html: script }} />
);
