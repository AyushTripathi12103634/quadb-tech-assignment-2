
$(document).ready(async function () {
  var countdownNumberEl = $('#countdown-number');
  var countdown = 60;

  countdownNumberEl.text(countdown);

  setInterval(async function () {
    countdown--;

    if (countdown <= 0) {
      countdown = 60;

      await fetch('http://localhost:3000/set-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));

      await fetch('http://localhost:3000/get-data')
        .then(response => response.json())
        .then(data => {
          console.log(data);

          // Clear the table
          $('table tr:not(:first)').remove();

          // Add the new data to the table
          data.result.forEach((item, index) => {
            const difference = ((item.sell - item.buy) / item.buy) * 100;
            const savings = item.sell - item.buy;
            const savingsSymbol = savings > 0 ? '⬆️' : '⬇️';

            $('table').append(`
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td>₹${item.last}</td>
                        <td>₹${item.buy} / ₹${item.sell}</td>
                        <td>${difference.toFixed(2)}%</td>
                        <td>${savingsSymbol} ₹${Math.abs(savings.toFixed(2))}</td>
                    </tr>
                `);
          });
        })
        .catch((error) => {
          console.warn("Unable to get data", error);
        });
    }

    countdownNumberEl.text(countdown);
  }, 1000);


  await fetch('http://localhost:3000/set-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

  await fetch('http://localhost:3000/get-data')
    .then(response => response.json())
    .then(data => {
      console.log(data);

      // Clear the table
      $('table tr:not(:first)').remove();

      // Add the new data to the table
      data.result.forEach((item, index) => {
        const difference = ((item.sell - item.buy) / item.buy) * 100;
        const savings = item.sell - item.buy;
        const savingsSymbol = savings > 0 ? '⬆️' : '⬇️';

        $('table').append(`
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>₹${item.last}</td>
                    <td>₹${item.buy} / ₹${item.sell}</td>
                    <td>${difference.toFixed(2)}%</td>
                    <td>${savingsSymbol} ₹${Math.abs(savings.toFixed(2))}</td>
                </tr>
            `);
      });
    })
    .catch((error) => {
      console.warn("Unable to get data", error);
    });

  // Use jQuery to attach a change event handler to the select element
  $('.round').change(async function () {
    // Get the selected value
    var selectedValue = $(this).val();

    await fetch(`http://localhost:3000/get-data/${selectedValue}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);

        // Calculate the percentage changes
        const fiveMinChange = ((data.five_min - data.five_min_old) / data.five_min_old) * 100;
        const oneHourChange = ((data.one_hour - data.one_hour_old) / data.one_hour_old) * 100;
        const oneDayChange = ((data.one_day - data.one_day_old) / data.one_day_old) * 100;
        const sevenDaysChange = ((data.seven_days - data.seven_days_old) / data.seven_days_old) * 100;

        // Update the HTML elements
        $('.middle-div-sec:eq(0) h1').text(fiveMinChange.toFixed(2) + '%');
        $('.middle-div-sec:eq(1) h1').text(oneHourChange.toFixed(2) + '%');
        $('.middle-div-in h1').text('₹ ' + data.last);
        $('.middle-div-in h7').text('Average ' + selectedValue + '/INR net price including commission');
        $('.middle-div-sec:eq(3) h1').text(oneDayChange.toFixed(2) + '%');
        $('.middle-div-sec:eq(4) h1').text(sevenDaysChange.toFixed(2) + '%');
      })
      .catch((error) => {
        console.warn(error);
      })
  });


});
