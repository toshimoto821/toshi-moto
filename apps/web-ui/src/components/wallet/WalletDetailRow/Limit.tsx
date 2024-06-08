import { useState } from "react";
import { Text, TextField } from "@radix-ui/themes";

type ILimit = {
  value: number;
  onBlur: (evt: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Limit = ({ value, onBlur }: ILimit) => {
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
    <div className="flex h-full">
      <div className="flex items-center ">
        <div className="mr-2 w-8">
          <TextField.Root
            size="1"
            placeholder="10"
            className="w-8"
            value={val}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>
        <div>
          <Text className="mr-2 text-gray-500" size="1">
            Limit
          </Text>
        </div>
      </div>
    </div>
  );
};
