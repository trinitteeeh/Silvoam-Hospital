export function checkDayChange(callback) {
    let lastDate = new Date().getDate();
  
    setInterval(() => {
      const currentDate = new Date().getDate();
      if (currentDate !== lastDate) {
        lastDate = currentDate;
        callback();
      }
    }, 3600000); // Check every hour (3600000 milliseconds)
  }