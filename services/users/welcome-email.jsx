module.exports = ({ site, user } = {}) => (
  <table align="center" width="600">
    <tr>
      <td style="text-align: center; font-family: Arial, sans-serif;" valign="top">
        <h1>Hi {user && user.name || user.email}!</h1>

        <p>You have now been registered at {site && site.title}.</p>
        
        <p><strong>This email is automatically generated.</strong></p>
      </td>
    </tr>
  </table>
);
