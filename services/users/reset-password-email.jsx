'use strict';

const h = require('hyperscript-jsx');

module.exports = (props) => (
  <table align="center" width="600">
    <tr>
      <td style="text-align: center; font-family: Arial, sans-serif;" valign="top">
        <h1>Hi</h1>
        <p>A password change request has been initiated for your account at <a
        href={props.site.url}>{props.site.title}</a>. Please follow the link below
        to finalize the change:</p>

        <p><a href={props.link}>{props.link}</a></p>

        <p>This link is only active for 24 hours.</p>

        <p><strong>This is an automated email, please do not reply to it.</strong></p>
      </td>
    </tr>
  </table>
);
