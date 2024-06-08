import { useState } from "react";
import { Text, TextField } from "@radix-ui/themes";

type IStartIndex = {
  value: number;
  onBlur: (evt: React.ChangeEvent<HTMLInputElement>) => void;
};

export const StartIndex = ({ value, onBlur }: IStartIndex) => {
  const [val, setValue] = useState(value + "");
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setValue(evt.target.value);
  };
  const handleBlur = (evt: React.ChangeEvent<HTMLInputElement>) => {
    onBlur({
      ...evt,
      target: {
        ...evt.target,
        value: val,
      },
    });
  };
  return (
    <div className="flex justify-start h-full">
      <div className="flex items-center ">
        <div className="mr-2 w-8">
          <TextField.Root
            size="1"
            value={val}
            placeholder="0"
            className="w-8"
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>
        <div>
          <Text className=" text-gray-500" size="1">
            Index
          </Text>
        </div>
      </div>
    </div>
  );
};
