import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface BlogContent {
  id: string;
  title: string;
  content: string;
  image: string;
  publishedAt: string;
}

const blogContents: Record<string, BlogContent> = {
  '1': {
    id: '1',
    title: 'Phát triển kỹ năng mềm cho trẻ: Tầm quan trọng và cách thức phát triển',
    content: `
      <p>Kỹ năng mềm là những kỹ năng quan trọng giúp trẻ thành công trong học tập, công việc và cuộc sống. 
      Bên cạnh các kiến thức học tập, bố mẹ cần trang bị cho trẻ các kỹ năng mềm cần thiết ngay từ khi còn nhỏ. 
      Vậy có những kỹ năng mềm nào là cần thiết và cách phát triển kỹ năng mềm cho trẻ như thế nào? Mời bố mẹ khám phá câu trả lời trong bài viết dưới đây!</p>
      
      <img src="/images/blog/blog1/111.png" alt="skill1" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 24px 0;">Kỹ năng mềm là gì?</h1>
      <img src="/images/blog/blog1/112.png" alt="skill2" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      <p>Kỹ năng mềm là những kỹ năng quan trọng giúp chúng ta hòa nhập với xã hội, thành công trong công việc và xây dựng mối quan hệ tốt đẹp với người khác. Một số kỹ năng mềm có thể kể đến như: làm việc nhóm, giao tiếp, quản lý thời gian, giải quyết vấn đề,…
      Kỹ năng cứng và kỹ năng mềm là hai khái niệm được sử dụng phổ biến trong lĩnh vực giáo dục và tuyển dụng. Kỹ năng cứng là những kỹ năng chuyên môn, kỹ thuật cần thiết để thực hiện một công việc cụ thể. Kỹ năng cứng có thể được học tập và rèn luyện thông qua các chương trình đào tạo, bồi dưỡng, hoặc qua quá trình làm việc thực tế. Kỹ năng mềm là những kỹ năng liên quan đến tính cách con người, không mang tính chuyên môn, không thể sờ nắm và có thể được phát triển thông qua quá trình rèn luyện, trải nghiệm.
      </p>

      <br>
      
      <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 24px 0;">Tầm quan trọng của kỹ năng mềm với trẻ</h1>
      <p>Kỹ năng mềm là chìa khóa giúp trẻ hòa nhập và khẳng định bản thân trong tập thể, cộng đồng và xã hội. Sở hữu những kỹ năng này giúp trẻ:</p>

      <br>

      <p>Hỗ trợ trẻ hòa nhập với xã hội: Khi sở hữu kỹ năng giao tiếp, làm việc nhóm, trẻ sẽ giao tiếp hiệu quả với người khác, xây dựng mối quan hệ tốt đẹp với bạn bè, thầy cô và gia đình. Từ đó trẻ sẽ nhanh chóng hòa nhập với xã hội, tự tin và tự lập hơn.
      Giúp trẻ thành công trong học tập: Kỹ năng giải quyết vấn đề, làm việc nhóm, quản lý thời gian,… giúp trẻ học tập hiệu quả hơn. Trẻ có thể tự giải quyết các vấn đề trong học tập, hợp tác tốt với bạn bè trong các dự án nhóm, quản lý thời gian học tập hợp lý,…
      </p>

      <br>

      <p>Phát triển sự nghiệp thành công: Kỹ năng mềm là một trong những yếu tố quan trọng quyết định sự thành công trong sự nghiệp. 
      Trẻ có kỹ năng mềm tốt sẽ có nhiều cơ hội thăng tiến trong công việc, được đánh giá cao bởi đồng nghiệp và cấp trên. </p>

      <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 24px 0;">Các kỹ năng mềm cần thiết cho trẻ</h1>
      
      <p>Trong bộ kỹ năng cần trang bị, dưới đây là những kỹ năng mềm cần thiết nhất:</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng tự phục vụ và bảo vệ bản thân</h2>
      <p>Bảo vệ và phục vụ bản thân là một trong những kỹ năng mềm quan trọng nhất đối với trẻ em, đặc biệt là lứa tuổi từ 6 đến 10 tuổi. Kỹ năng này giúp trẻ có nhận thức chính xác về bản thân, biết cách tự bảo vệ mình trước những nguy hiểm và biết cách tự chăm sóc. 
      Trẻ sẽ biết xử lý khi gặp người lạ, bảo vệ bản thân khi bị bắt cóc hoặc đi lạc, 
      hét thật to để cầu cứu khi cần thiết,…</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng quản lý cảm xúc</h2>
      <p>Không giống khi ở nhà được ông bà, bố mẹ nuông chiều, trẻ khi đến trường cần biết quản lý cảm xúc của bản thân. 
      Khi trẻ biết kiểm soát cảm xúc, trẻ sẽ tránh được những hành vi thiếu suy nghĩ như nổi giận, bốc đồng, hoặc làm tổn thương người khác. 
      Đồng thời, trẻ cũng sẽ biết quan tâm, cảm thông và chia sẻ với người khác nhiều hơn.</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng quản lý thời gian</h2>
      <p>Có kỹ năng quản lý thời gian, trẻ sẽ biết cách trân trọng thời gian, sử dụng thời gian một cách hiệu quả, từ đó đạt được mục tiêu của bản thân. 
      Tuy nhiên, để có được kỹ năng này, trẻ cần phải trải qua một quá trình rèn luyện lâu dài. 
      Bởi lẽ, trẻ thường quen với sự sắp xếp của cha mẹ và chưa có khả năng hình dung kế hoạch trong tương lai.</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng làm việc đội nhóm</h2>
      <p>Trong xã hội hội nhập và phát triển như hiện nay, kỹ năng làm việc nhóm  càng trở nên cần thiết hơn bao giờ hết. 
      Đây không chỉ đơn giản là việc trẻ “tồn tại” trong một tập thể, mà còn là khả năng phối hợp chặt chẽ với người khác để đạt được mục tiêu chung. 
      Cha mẹ và nhà trường cần tạo cơ hội cho trẻ tham gia các hoạt động tập thể, như: hoạt động ngoại khóa, câu lạc bộ, đội nhóm,… 
      để trẻ có cơ hội rèn luyện kỹ năng làm việc nhóm.</p>
      
      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng giao tiếp ứng xử</h2>
      <p>Từ 5 đến 10 tuổi, trẻ có sự phát triển vượt trội về ngôn ngữ. Đây là giai đoạn vàng để trẻ học hỏi và hình thành các kỹ năng giao tiếp và ứng xử. 
      Cha mẹ cần ưu tiên dạy trẻ những kỹ năng này ngay từ nhỏ để giúp trẻ phát triển toàn diện và có được những mối quan hệ tốt đẹp với mọi người xung quanh.</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng tự nhận thức</h2>
      <p>Kỹ năng tự nhận thức là khả năng hiểu biết về bản thân, bao gồm nhận thức về cảm xúc, suy nghĩ, giá trị, sở thích, điểm mạnh, điểm yếu, v.v. 
      Nhờ có kỹ năng này, trẻ sẽ nhìn nhận bản thân một cách khách quan và chính xác hơn, 
      xác định được mục tiêu và định hướng nghề nghiệp của bản thân thay vì bị ảnh hưởng bởi những định kiến hay kỳ vọng của người khác. 
      Không chỉ vậy, khi hiểu rõ bản thân, trẻ sẽ biết cách ứng xử phù hợp và tôn trọng người khác.</p>

      <br>
      <h2 style="font-size: 20px; font-weight: bold; color: #1f2937;">Kỹ năng giải quyết vấn đề</h2>
      <p>Kỹ năng giải quyết vấn đề là một trong những kỹ năng mềm quan trọng nhất mà trẻ em cần được trang bị. 
      Kỹ năng này giúp trẻ có khả năng nhận biết và giải quyết các vấn đề một cách hiệu quả, 
      từ đó phát triển tư duy, khả năng sáng tạo và tự tin.</p>

      <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 24px 0;">Các hoạt động phát triển kỹ năng mềm cho trẻ</h1>
      
             <p>Bố mẹ có thể rèn luyện kỹ năng mềm cho trẻ thông qua các hoạt động hàng ngày như:</p>
       <br>
       <ul style="list-style-type: disc; margin-left: 20px; line-height: 1.8;">
         <li style="margin-bottom: 12px;">
           <strong>Cho trẻ chơi trò chơi:</strong> Trò chơi là một cách tuyệt vời để trẻ học hỏi và phát triển các kỹ năng mềm. 
           Bố mẹ và thầy cô có thể khuyến khích trẻ tham gia các trò chơi như đóng vai, kể chuyện, giải đố,…
         </li>
         <li style="margin-bottom: 12px;">
           <strong>Hoạt động ngoại khóa:</strong> Tham gia hoạt động ngoại khóa giúp trẻ giao tiếp, kết nối với mọi người và phát triển các kỹ năng mềm.
           Các hoạt động ngoại khóa trẻ có thể tham gia như chơi thể thao, vẽ tranh, tình nguyện,…
         </li>
         <li style="margin-bottom: 12px;">
           <strong>Môi trường gia đình:</strong> Bố mẹ là những người ảnh hưởng lớn nhất đến sự phát triển của trẻ. 
           Bố mẹ nên tạo ra một môi trường gia đình tích cực, khuyến khích trẻ giao tiếp, chia sẻ và thể hiện bản thân.
         </li>
       </ul>
       <img src="/images/blog/blog1/113.jpg" alt="skill3" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />

       <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 24px 0;">Khóa học phát triển kỹ năng mềm cho trẻ tại Future Wings</h1>

       <p>Trong thời đại mới, trẻ em cần được trang bị đầy đủ kỹ năng sống và kiến thức để tồn tại và phát triển. Kỹ năng sống giúp trẻ tự tin, 
       chủ động và có khả năng ứng phó với những thay đổi của xã hội. Kiến thức giúp trẻ hiểu biết về thế giới xung quanh và có nền tảng vững chắc để học tập, 
       làm việc và phát triển bản thân. <p>

       <br>

       <p>Bên cạnh sự đồng hành của bố mẹ, trẻ cần được rèn luyện trong một môi trường học tập tốt nhất với sự trợ giúp của những người có chuyên môn. 
       Môi trường học tập tốt sẽ giúp trẻ phát triển toàn diện cả về thể chất, trí tuệ và tinh thần. </p>

       <br>

       <p>Tại các khóa học của Future Wings, các em học sinh sẽ được trang bị bộ kỹ năng mềm gắn liền với học tập. Bộ kỹ năng này bao gồm các kỹ năng quan trọng như giao tiếp, thuyết trình, 
       làm việc nhóm thông qua các khóa học Đọc, Viết, Kể chuyện, 
       giúp học sinh phát triển toàn diện cả về tư duy, kỹ năng và thái độ.</p>

       <br>

       <p>Hy vọng rằng thông qua bài viết này, bố mẹ đã có cái nhìn rõ ràng hơn về cách phát triển kỹ năng mềm cho trẻ. 
       Nếu cần hỗ trợ thêm, bố mẹ hãy liên hệ tới 
       hotline của Future Wings: <b>0853326829</b> để nhận tư vấn nhanh chóng nhé!</p>

    `,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    publishedAt: '15 Tháng 12, 2024'
  },
  '2': {
    id: '2',
    title: 'Muốn chữa ngọng cho trẻ, phải làm sao?',
    content: `
      <p>Bạn có nhận thấy con mình phát âm sai một số âm như "l" – "n", "s" – "x",
       hay nói líu lưỡi khiến người khác khó hiểu? Đó có thể là dấu hiệu trẻ đang gặp vấn đề về phát âm – nói ngọng,
       nếu không được can thiệp kịp thời sẽ ảnh hưởng đến giao tiếp, sự tự tin và khả năng học tập sau này.</p>

      <br>

      <p>Nhiều bậc phụ huynh lo lắng nhưng không biết bắt đầu từ đâu, nên tìm chuyên gia hay luyện tại nhà, và liệu nói ngọng có tự hết theo thời gian?
       Bài viết dưới đây sẽ giúp bạn hiểu rõ nguyên nhân, dấu hiệu và cách chữa ngọng hiệu quả cho trẻ một cách khoa học và nhẹ nhàng nhất. </p>
      
      <img src="/images/blog/2.png" alt="React development" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">Nói ngọng ở trẻ có nguy hiểm?</h1>
      <p><b>Nói ngọng </b> là rối loạn phát âm lời hay trẻ nói không rõ từ, thường xảy ra ở hầu hết trẻ, 
      nhất là trong giai đoạn lúc bắt đầu tập nói. Theo thời gian tăng trưởng, 
      các cấu trúc phát âm như hàm, môi, lưỡi, răng, lưỡi gà… phát triển thì lời nói của trẻ sẽ rõ hơn; 
      các âm nói rõ hơn cũng tùy theo các giai đoạn phát triển của trẻ, ví dụ âm m, 
      b trẻ phát âm đúng từ khi còn nhỏ, còn âm r, s, tr sẽ nói rõ khi trẻ lớn hơn. 
      Tuy nhiên, có một số trẻ sẽ không tự khỏi và điều này ảnh hưởng rất nhiều đến trẻ trong quá trình giao tiếp, 
      ảnh hưởng đến tâm lý của trẻ. </p>
      <br>

      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">Nguyên nhân nói ngọng ở trẻ</h1>
      <p>Thông hường, có 2 dạng nói ngọng phổ biến nhất ở trẻ em là <b>nói ngọng sinh lý</b> ( là dạng nói ngọng bẩm  sinh do cơ quan phát âm có vấn đề)
       và <b>nói ngọng do tính chất xã hội</b> ( do quá trình tập nói phát âm lệch chuẩn)</p>

      <br>
       <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">Biện pháp khắc phục tình trạng nói ngọng</h1>
      <p>Nếu dưới 6 tuổi, trẻ nói ngọng cũng là điều bình thường và dưới độ tuổi này cho con theo học các lớp chữa ngọng, 
      vẫn có thể khắc phục được. Nhưng nếu sau 6 tuổi, trẻ vẫn nói ngọng có lẽ cơ quan phát âm của trẻ đang gặp vấn đề, 
      trong trường hợp này, cha mẹ cần đưa con đến bác sĩ kiểm tra các cấu trúc phát âm 
      và các âm trẻ nói sai để hướng dẫn trẻ cách đặt vị trí đúng của cơ quan phát âm, 
      cách nhận ra âm nào đúng âm nào sai, cách sử dụng đúng các quy luật phát âm để trẻ nói rõ ràng và dễ hiểu.</p>

      <br>
      <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">Một số phương pháp chữa nói ngọng cho trẻ</h1>
             <p>Ngay từ khi còn nhỏ, bố mẹ cần phải chú ý cho con hình thành những thói quen sau:</p>
       
       <br>
       <ol style="margin-left: 20px; line-height: 1.8; counter-reset: item;">
         <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
           <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">1</span>
           Luyện cơ hàm cho con ngay khi con nhỏ như ăn các loại thức phẩm có lợi để con có cơ hàm khỏe mạnh, linh hoạt.
         </li>
                    <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">2</span>
             Tập cơ má và lưỡi, hướng dẫn con sức miệng làm một vật (có thể là viên kẹo) từ má này sang má khác trong miệng để có cơ má và lưỡi mềm.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">3</span>
             Phòng tránh mắc các bệnh ngạt mũi, khó thở vì phải thở bằng miệng. Khi trẻ bị bệnh cần điều trị để con thở tự nhiên bằng cả miệng và mũi.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">4</span>
             Cha mẹ không cố tình phát âm sai theo con, làm trẻ nghĩ nói như thế sẽ hay hơn.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">5</span>
             Giúp con thoải mái nhất khi giao tiếp, không nói nhiều, hối dốn khiến con lúng túng dẫn đến nói lắp, nói ngọng.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">6</span>
             Thường xuyên nói chuyện, hát, đọc sách cho con nghe, đừng để ngữ thất chuẩn để con có thể bắt chước theo.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">7</span>
             Cho con tiếp xúc với môi trường bên ngoài để tăng cường hoạt động giao tiếp, trẻ sẽ có cơ hội để học hỏi cách nói của người khác.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">8</span>
             Hạn chế cho con tiếp xúc với những người nói ngọng, khi con nói ngọng thì tuyệt đối không mại lại sẽ làm con không phân biệt được đúng sai.
           </li>
           <li style="margin-bottom: 15px; display: block; position: relative; padding-left: 30px;">
             <span style="position: absolute; left: 0; top: 2px; background: #02458b; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; text-align: center; line-height: 1;">9</span>
           Khi chữa lại nói ngọng cho con, các bậc phụ huynh cần sự kiên trì bởi đây là công việc không thể thành công trong ngày một ngày hai, khi phát hiện con nói ngọng, phải chỉ ra và bắt con sửa ngay lập tức. Nếu nghĩ ngờ con bị nói ngọng do yếu tố sinh lý như ngắn lưỡi, dài lưỡi, tệ ở lưỡi, ở có hỏng... thì cần đưa con đi khám để kịp thời khắc phục.
         </li>
       </ol>
 
      `,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    publishedAt: '12 Tháng 12, 2024'
  },
  '3': {
    id: '3',
    title: 'Xu hướng công nghệ 2024: AI và Machine Learning',
    content: `
      <p>Năm 2024 đánh dấu bước ngoặt quan trọng trong việc ứng dụng AI và Machine Learning vào thực tế. Hãy cùng khám phá những xu hướng nổi bật nhất.</p>
      
      <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop" alt="AI Circuit board" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h3>1. Generative AI và ChatGPT</h3>
      <p>Công nghệ AI tạo sinh đã thay đổi cách chúng ta làm việc, từ viết code đến tạo nội dung sáng tạo.</p>
      
      <h3>2. Machine Learning tự động (AutoML)</h3>
      <p>AutoML giúp các developer không chuyên về ML cũng có thể xây dựng và triển khai các mô hình AI hiệu quả.</p>
      
      <img src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=400&fit=crop" alt="AI screens" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h3>3. Edge AI và IoT</h3>
      <p>Việc đưa AI xuống các thiết bị edge mở ra nhiều ứng dụng thực tế trong smart home, autonomous vehicles.</p>
      
      <h3>4. Cơ hội nghề nghiệp</h3>
      <p>Nhu cầu về AI Engineer, ML Engineer, và Data Scientist đang tăng mạnh. Đây là thời điểm tốt để đầu tư học các kỹ năng này.</p>
      
      <p>Tương lai thuộc về những người biết cách kết hợp AI với domain knowledge cụ thể. Hãy bắt đầu học AI ngay hôm nay để không bị bỏ lại phía sau.</p>
    `,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
    publishedAt: '10 Tháng 12, 2024'
  }
};

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const blog = id ? blogContents[id] : null;

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bài viết không tồn tại</h1>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            Quay về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy link bài viết!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại trang chủ
          </Button>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">           
            <div className="p-8">
              
              <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#02458b' }}>
                {blog.title}
              </h1>
              
              <div 
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content }}
                style={{
                  lineHeight: '1.8',
                }}
              />
            </div>
          </div>
        </div>
      </article>
      
      <Footer />
    </div>
  );
};

export default BlogDetailPage;
